# schemas.py
# ─────────────────────────────────────────────
# Pydantic schemas for request/response validation.
# Think of these as "contracts" — what data shape
# the API accepts and returns.
# ─────────────────────────────────────────────

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── AUTH SCHEMAS ──────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    company: Optional[str] = None
    job_title: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ── USER SCHEMAS ──────────────────────────────
class UserUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    avatar_color: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    company: Optional[str]
    job_title: Optional[str]
    avatar_color: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── PREDICTION SCHEMAS ────────────────────────
class CustomerPredictionResponse(BaseModel):
    id: int
    customer_name: Optional[str]
    customer_index: int
    churn_probability: float
    risk_level: str
    top_factors: Optional[list]
    ai_explanation: Optional[str]
    ai_recommendations: Optional[list]
    segment: Optional[str]

    class Config:
        from_attributes = True

class AnalysisResponse(BaseModel):
    id: int
    filename: str
    total_customers: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    avg_churn_prob: float
    executive_summary: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class AnalysisDetailResponse(AnalysisResponse):
    customers: List[CustomerPredictionResponse]

    class Config:
        from_attributes = True


# ── PASSWORD CHANGE SCHEMA ────────────────────
class PasswordChange(BaseModel):
    current_password: str
    new_password: str