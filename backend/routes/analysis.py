# routes/analysis.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas
from ml.predictor import predict_batch
from ai.gemini import get_customer_insight, get_executive_summary
import pandas as pd
from fastapi.responses import StreamingResponse
import io
import math
import json


def sanitize_for_json(obj):
    """Convert to JSON string and back to strip NaN values that
    PostgreSQL JSON columns cannot store."""
    try:
        return json.loads(json.dumps(obj, allow_nan=False))
    except (ValueError, TypeError):
        if isinstance(obj, dict):
            return {
                k: (None if isinstance(v, float) and math.isnan(v) else v)
                for k, v in obj.items()
            }
        return obj

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])


@router.get("/template")
def download_template():
    """Returns a sample CSV template with correct headers and 3 example rows"""
    template_data = """customerID,gender,SeniorCitizen,Partner,Dependents,tenure,PhoneService,MultipleLines,InternetService,OnlineSecurity,OnlineBackup,DeviceProtection,TechSupport,StreamingTV,StreamingMovies,Contract,PaperlessBilling,PaymentMethod,MonthlyCharges,TotalCharges
CUST-0001,Male,0,Yes,No,12,Yes,No,DSL,Yes,No,No,No,No,No,Month-to-month,Yes,Electronic check,55.5,650.25
CUST-0002,Female,1,No,No,3,Yes,Yes,Fiber optic,No,No,No,No,Yes,Yes,Month-to-month,Yes,Electronic check,89.9,267.7
CUST-0003,Male,0,Yes,Yes,48,Yes,No,DSL,Yes,Yes,Yes,Yes,No,No,Two year,No,Bank transfer (automatic),62.3,2990.4"""
    return StreamingResponse(
        io.StringIO(template_data),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=retainiq_template.csv"}
    )



@router.post("/upload")
async def upload_and_analyze(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Main endpoint: Upload CSV → ML prediction → AI insights → Save to DB
    
    Flow:
    1. Read uploaded CSV
    2. Run ML predictions on all customers
    3. For HIGH risk customers → call Gemini for explanation
    4. Generate executive summary
    5. Save everything to database
    6. Return results
    """

    # ── Read CSV ──────────────────────────────
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted")

    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

    if len(df) == 0:
        raise HTTPException(status_code=400, detail="CSV file is empty")

    if len(df) > 1000:
        raise HTTPException(status_code=400, detail="Max 1000 customers per upload")

    # ── Run ML Predictions ────────────────────
    predictions = predict_batch(df)

    # ── Calculate Stats ───────────────────────
    high_risk   = [p for p in predictions if p["risk_level"] == "High"]
    medium_risk = [p for p in predictions if p["risk_level"] == "Medium"]
    low_risk    = [p for p in predictions if p["risk_level"] == "Low"]
    total       = len(predictions)
    avg_prob    = sum(p["churn_probability"] for p in predictions) / total

    # Top factors across all customers
    all_factors = []
    for p in predictions:
        all_factors.extend([f["feature"] for f in p["top_factors"][:2]])
    top_global_factors = list(set(all_factors))[:5]

    # ── Generate Executive Summary (Gemini) ───
    summary_stats = {
        "total": total,
        "high_risk": len(high_risk),
        "high_risk_pct": len(high_risk) / total * 100,
        "medium_risk": len(medium_risk),
        "medium_risk_pct": len(medium_risk) / total * 100,
        "low_risk": len(low_risk),
        "low_risk_pct": len(low_risk) / total * 100,
        "avg_prob": avg_prob,
        "top_factors": top_global_factors
    }
    executive_summary = get_executive_summary(summary_stats)

    # ── Save Analysis to DB ───────────────────
    analysis = models.AnalysisHistory(
        user_id           = current_user.id,
        filename          = file.filename,
        total_customers   = total,
        high_risk_count   = len(high_risk),
        medium_risk_count = len(medium_risk),
        low_risk_count    = len(low_risk),
        avg_churn_prob    = round(avg_prob, 4),
        executive_summary = executive_summary
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    # ── Save Each Customer + AI Insights ─────
    saved_customers = []
    for pred in predictions:
        # Only call Gemini for High risk customers (save API quota)
        ai_data = {"explanation": None, "recommendations": None, "segment": "Low Risk"}

        if pred["risk_level"] in ["High", "Medium"]:
            ai_data = get_customer_insight(
                features          = pred["features"],
                top_factors       = pred["top_factors"],
                churn_probability = pred["churn_probability"]
            )

        # Try to get customer name from CSV
        customer_name = None
        if "customerID" in pred["features"]:
            customer_name = str(pred["features"]["customerID"])

        customer_rec = models.CustomerPrediction(
            analysis_id        = analysis.id,
            user_id            = current_user.id,
            customer_name      = customer_name,
            customer_index     = pred["index"],
            features           = sanitize_for_json(pred["features"]),
            churn_probability  = pred["churn_probability"],
            risk_level         = pred["risk_level"],
            top_factors        = sanitize_for_json(pred["top_factors"]),
            ai_explanation     = ai_data.get("explanation"),
            ai_recommendations = sanitize_for_json(ai_data.get("recommendations")),
            segment            = ai_data.get("segment")
        )
        db.add(customer_rec)
        saved_customers.append(customer_rec)

    db.commit()

    return {
        "analysis_id":       analysis.id,
        "filename":          file.filename,
        "total_customers":   total,
        "high_risk_count":   len(high_risk),
        "medium_risk_count": len(medium_risk),
        "low_risk_count":    len(low_risk),
        "avg_churn_prob":    round(avg_prob, 4),
        "executive_summary": executive_summary,
        "created_at":        analysis.created_at.isoformat()
    }


@router.get("/history", response_model=list[schemas.AnalysisResponse])
def get_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all past analyses for current user, newest first"""
    analyses = db.query(models.AnalysisHistory).filter(
        models.AnalysisHistory.user_id == current_user.id
    ).order_by(models.AnalysisHistory.created_at.desc()).all()
    return analyses


@router.get("/{analysis_id}", response_model=schemas.AnalysisDetailResponse)
def get_analysis_detail(
    analysis_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get full details of one analysis including all customer predictions"""
    analysis = db.query(models.AnalysisHistory).filter(
        models.AnalysisHistory.id      == analysis_id,
        models.AnalysisHistory.user_id == current_user.id
    ).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return analysis


@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an analysis and all its customer predictions"""
    analysis = db.query(models.AnalysisHistory).filter(
        models.AnalysisHistory.id      == analysis_id,
        models.AnalysisHistory.user_id == current_user.id
    ).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    db.delete(analysis)
    db.commit()
    return {"message": "Analysis deleted successfully"}