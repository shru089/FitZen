from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.user import UserProfileUpdate, UserOut
from auth_utils import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current user's full profile."""
    return current_user


@router.put("/profile", response_model=UserOut)
def update_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update profile fields (name, age, weight, height, goal, calorie goal, etc.)."""
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Soft-delete the user account (sets is_active=False)."""
    current_user.is_active = False
    db.commit()
