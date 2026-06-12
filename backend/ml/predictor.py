# ml/predictor.py
# ─────────────────────────────────────────────
# Loads saved ML model artifacts and provides
# prediction + SHAP explanation functions.
# This is the bridge between FastAPI and our ML model.
# ─────────────────────────────────────────────

import math
import joblib
import numpy as np
import pandas as pd
import shap
import os
from dotenv import load_dotenv

load_dotenv()


def clean_nan(obj):
    """Recursively replace NaN/Inf floats with None for JSON safety.
    PostgreSQL JSON columns reject Python NaN/Inf values outright."""
    if isinstance(obj, dict):
        return {k: clean_nan(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan(i) for i in obj]
    elif isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    return obj

# ── Load Model Artifacts Once at Startup ─────
# We load these ONCE when server starts (not on every request)
# Loading .pkl files is slow — do it once, reuse always

MODEL_PATH    = os.getenv("ML_MODEL_PATH", "../ml_model/churn_model.pkl")
SCALER_PATH   = os.getenv("SCALER_PATH",   "../ml_model/scaler.pkl")
FEATURES_PATH = os.getenv("FEATURES_PATH", "../ml_model/feature_names.pkl")

print("📦 Loading ML model artifacts...")
model         = joblib.load(MODEL_PATH)
scaler        = joblib.load(SCALER_PATH)
feature_names = joblib.load(FEATURES_PATH)
explainer     = shap.TreeExplainer(model)
print("✅ ML model loaded successfully")


def preprocess_dataframe(df: pd.DataFrame) -> np.ndarray:
    """
    Preprocess incoming customer data EXACTLY like training.
    Critical: same encoding + same scaler must be applied.
    """
    # Drop customerID if present
    if "customerID" in df.columns:
        df = df.drop("customerID", axis=1)

    # Drop Churn column if present (it's the target, not a feature)
    if "Churn" in df.columns:
        df = df.drop("Churn", axis=1)

    # Fix TotalCharges
    if "TotalCharges" in df.columns:
        df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
        df["TotalCharges"].fillna(df["TotalCharges"].median(), inplace=True)

    # One-hot encode categorical columns
    categorical_cols = df.select_dtypes(include="object").columns.tolist()
    df = pd.get_dummies(df, columns=categorical_cols, drop_first=True)

    # Align columns with training features
    # Add missing columns as 0, remove extra columns
    for col in feature_names:
        if col not in df.columns:
            df[col] = 0
    df = df[feature_names]  # reorder to match training order

    # Scale using the saved scaler (transform only, not fit!)
    X_scaled = scaler.transform(df)
    return X_scaled, df


def get_risk_level(probability: float) -> str:
    """Convert probability to human-readable risk level"""
    if probability >= 0.7:
        return "High"
    elif probability >= 0.4:
        return "Medium"
    else:
        return "Low"


def get_top_shap_factors(shap_vals: np.ndarray, n: int = 5) -> list:
    """
    Get top N features driving the prediction.
    Positive SHAP = pushes toward churn
    Negative SHAP = pushes away from churn
    """
    factors = []
    indices = np.argsort(np.abs(shap_vals))[::-1][:n]
    for i in indices:
        factors.append({
            "feature": feature_names[i],
            "value": float(shap_vals[i]),
            "direction": "increases" if shap_vals[i] > 0 else "decreases"
        })
    return factors


def predict_batch(df: pd.DataFrame) -> list:
    """
    Run predictions on a batch of customers (from CSV upload).
    Returns list of prediction dicts for each customer.
    """
    X_scaled, X_df = preprocess_dataframe(df.copy())

    # Get churn probabilities for all customers
    probabilities = model.predict_proba(X_scaled)[:, 1]

    # Get SHAP values for all customers
    shap_values = explainer.shap_values(X_scaled)

    results = []
    for i in range(len(df)):
        prob = float(probabilities[i])

        results.append({
            "index": i,
            "churn_probability": round(prob, 4),
            "risk_level": get_risk_level(prob),
            "top_factors": clean_nan(get_top_shap_factors(shap_values[i])),
            "features": clean_nan(df.iloc[i].to_dict())
        })

    return results