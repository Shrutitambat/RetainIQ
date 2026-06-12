from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.TokenResponse)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user.
    1. Check email not already taken
    2. Hash the password
    3. Save user to DB
    4. Return JWT token so user is immediately logged in
    """
    # Check if email already exists
    existing = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user with hashed password
    new_user = models.User(
        name          = user_data.name,
        email         = user_data.email,
        password_hash = hash_password(user_data.password),
        company       = user_data.company,
        job_title     = user_data.job_title
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create JWT token
    token = create_access_token({"sub": new_user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "company": new_user.company
        }
    }


@router.post("/login", response_model=schemas.TokenResponse)
async def login(request: Request, db: Session = Depends(get_db)):
    """
    Login with email + password.
    Supports JSON body (email/username) and form data (username/password)
    for OAuth2 / Swagger UI compatibility.
    """
    email = None
    password = None
    content_type = request.headers.get("content-type", "")

    if "application/x-www-form-urlencoded" in content_type:
        form_data = await request.form()
        email = form_data.get("username")
        password = form_data.get("password")
    else:
        # Default to JSON parsing
        try:
            json_data = await request.json()
            email = json_data.get("email") or json_data.get("username")
            password = json_data.get("password")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid request content. Expected JSON or Form data."
            )

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Missing email (username) or password"
        )

    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_418_IM_A_TEAPOT if False else status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    token = create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "company": user.company
        }
    }