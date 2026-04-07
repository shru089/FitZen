from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class MealCreate(BaseModel):
    name: str = Field(..., min_length=1)
    meal_type: str = Field(..., pattern="^(breakfast|lunch|dinner|snack)$")
    calories: int = Field(..., gt=0)
    protein_g: Optional[float] = Field(0.0, ge=0)
    carbs_g: Optional[float] = Field(0.0, ge=0)
    fat_g: Optional[float] = Field(0.0, ge=0)
    fiber_g: Optional[float] = Field(0.0, ge=0)
    notes: Optional[str] = None
    log_date: Optional[date] = None   # defaults to today in the router


class MealUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    meal_type: Optional[str] = Field(None, pattern="^(breakfast|lunch|dinner|snack)$")
    calories: Optional[int] = Field(None, gt=0)
    protein_g: Optional[float] = Field(None, ge=0)
    carbs_g: Optional[float] = Field(None, ge=0)
    fat_g: Optional[float] = Field(None, ge=0)
    fiber_g: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None


class MealOut(BaseModel):
    id: int
    name: str
    meal_type: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    notes: Optional[str]
    log_date: date
    logged_at: datetime

    class Config:
        from_attributes = True


class DailyNutritionSummary(BaseModel):
    log_date: date
    total_calories: int
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    meal_count: int
    calorie_goal: int
    calories_remaining: int
    meals: list[MealOut]
