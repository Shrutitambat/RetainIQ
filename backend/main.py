# main.py
# ─────────────────────────────────────────────
# FastAPI application entry point.
# This is what uvicorn runs when you start the server.
# ─────────────────────────────────────────────

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models

# Import all routers
from routes.auth     import router as auth_router
from routes.users    import router as users_router
from routes.analysis import router as analysis_router

# Create all DB tables on startup (if they don't exist)
models.Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title       = "Customer Churn Intelligence Platform",
    description = "ML-powered churn prediction with AI insights",
    version     = "1.0.0"
)

# CORS: allows React frontend (localhost:5173) to call our API
# Without this, browser blocks cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["http://localhost:5173", "http://localhost:3000"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# Register all route groups
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(analysis_router)


@app.get("/")
def root():
    return {
        "message": "Churn Intelligence Platform API",
        "status":  "running",
        "docs":    "/docs"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}