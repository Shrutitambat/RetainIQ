# models.py
# ─────────────────────────────────────────────
# SQLAlchemy models = Database tables
# Each class here creates one table in PostgreSQL
# ─────────────────────────────────────────────

from sqlalchemy import (
    Column, Integer, String, Float,
    DateTime, ForeignKey, Text, Boolean, JSON
)
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    """
    Stores registered users.
    One user can have many analyses (one-to-many relationship)
    """
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    company       = Column(String(100), nullable=True)
    job_title     = Column(String(100), nullable=True)
    avatar_color  = Column(String(20), default="#6366f1")  # for UI avatar
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship: access user.analyses to get all their analyses
    analyses = relationship("AnalysisHistory", back_populates="user", cascade="all, delete")


class AnalysisHistory(Base):
    """
    Each time a user uploads a CSV and runs analysis,
    one record is created here as the parent container.
    """
    __tablename__ = "analysis_history"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename          = Column(String(255))
    total_customers   = Column(Integer, default=0)
    high_risk_count   = Column(Integer, default=0)
    medium_risk_count = Column(Integer, default=0)
    low_risk_count    = Column(Integer, default=0)
    avg_churn_prob    = Column(Float, default=0.0)
    executive_summary = Column(Text, nullable=True)
    created_at        = Column(DateTime, default=datetime.utcnow)

    user      = relationship("User", back_populates="analyses")
    customers = relationship("CustomerPrediction", back_populates="analysis", cascade="all, delete")


class CustomerPrediction(Base):
    """
    Each customer row from the uploaded CSV gets one record here.
    Stores ML prediction + AI explanation for that customer.
    """
    __tablename__ = "customer_predictions"

    id               = Column(Integer, primary_key=True, index=True)
    analysis_id      = Column(Integer, ForeignKey("analysis_history.id"), nullable=False)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False)
    customer_name    = Column(String(100), nullable=True)
    customer_index   = Column(Integer)             # row number in CSV
    features         = Column(JSON)                # original feature values
    churn_probability= Column(Float)               # 0.0 to 1.0
    risk_level       = Column(String(20))          # High / Medium / Low
    top_factors      = Column(JSON)                # top SHAP features
    ai_explanation   = Column(Text, nullable=True) # Gemini explanation
    ai_recommendations = Column(JSON, nullable=True) # list of recommendations
    segment          = Column(String(50), nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("AnalysisHistory", back_populates="customers")