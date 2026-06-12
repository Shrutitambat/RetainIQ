# auth.py
# ─────────────────────────────────────────────
# Authentication utilities:
# - Password hashing with bcrypt (one-way, can't reverse)
# - JWT token creation and verification
# - get_current_user dependency for protected routes
# ─────────────────────────────────────────────

from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models
import os
from dotenv import load_dotenv

load_dotenv()

# bcrypt context for hashing passwords
# Never store plain text passwords — always hash them
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme — looks for "Bearer <token>" in Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM  = os.getenv("ALGORITHM")
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))


def hash_password(password: str) -> str:
    """Convert plain password to bcrypt hash"""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Check if plain password matches the stored hash"""
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    """
    Create a JWT token.
    JWT = JSON Web Token — a signed string that proves identity.
    It contains: user email + expiry time, signed with our SECRET_KEY.
    Frontend sends this token in every request header.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str):
    """Decode JWT and return email, or None if invalid/expired"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")  # "sub" = subject = user email
    except JWTError:
        return None


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """
    FastAPI dependency — used in protected routes.
    Automatically extracts token from request header,
    validates it, and returns the current User object.
    
    Usage in routes:
        @router.get("/protected")
        def protected(user = Depends(get_current_user)):
            ...
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    email = decode_token(token)
    if not email:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise credentials_exception
    return user