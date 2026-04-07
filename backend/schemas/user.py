from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ─── Registration / Login ────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ─── Profile Update ──────────────────────────────────────────────────────────

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=10, le=120)
    weight_kg: Optional[float] = Field(None, gt=0)
    height_cm: Optional[float] = Field(None, gt=0)
    goal: Optional[str] = None           # lose_weight | gain_muscle | maintain
    activity_level: Optional[str] = None # sedentary | light | moderate | active
    calorie_goal: Optional[int] = Field(None, gt=0)


# ─── Response Schemas ────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    goal: Optional[str] = None
    activity_level: Optional[str] = None
    calorie_goal: int
    current_streak: int
    longest_streak: int
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
