# routes/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user, hash_password, verify_password
import models, schemas

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(get_current_user)):
    """Get current logged-in user's profile"""
    return current_user


@router.put("/me", response_model=schemas.UserResponse)
def update_profile(
    update_data: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile fields (name, company, job title, avatar color)"""
    if update_data.name is not None:
        current_user.name = update_data.name
    if update_data.company is not None:
        current_user.company = update_data.company
    if update_data.job_title is not None:
        current_user.job_title = update_data.job_title
    if update_data.avatar_color is not None:
        current_user.avatar_color = update_data.avatar_color

    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password")
def change_password(
    password_data: schemas.PasswordChange,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change password — requires current password verification"""
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    current_user.password_hash = hash_password(password_data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.delete("/me")
def delete_account(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete account and all associated data"""
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully"}