from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.nutrition import Meal
from schemas.nutrition import MealCreate, MealUpdate, MealOut, DailyNutritionSummary
from auth_utils import get_current_user

router = APIRouter(prefix="/api/nutrition", tags=["Nutrition"])


def _today() -> date:
    return date.today()


@router.post("/meals", response_model=MealOut, status_code=status.HTTP_201_CREATED)
def log_meal(
    payload: MealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a new meal for the current user."""
    meal = Meal(
        user_id=current_user.id,
        name=payload.name,
        meal_type=payload.meal_type,
        calories=payload.calories,
        protein_g=payload.protein_g or 0.0,
        carbs_g=payload.carbs_g or 0.0,
        fat_g=payload.fat_g or 0.0,
        fiber_g=payload.fiber_g or 0.0,
        notes=payload.notes,
        log_date=payload.log_date or _today(),
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal


@router.get("/meals", response_model=list[MealOut])
def list_meals(
    log_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List meals. Optionally filter by date (defaults to today)."""
    target_date = log_date or _today()
    return (
        db.query(Meal)
        .filter(Meal.user_id == current_user.id, Meal.log_date == target_date)
        .order_by(Meal.logged_at)
        .all()
    )


@router.get("/meals/{meal_id}", response_model=MealOut)
def get_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return meal


@router.put("/meals/{meal_id}", response_model=MealOut)
def update_meal(
    meal_id: int,
    payload: MealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(meal, field, value)

    db.commit()
    db.refresh(meal)
    return meal


@router.delete("/meals/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    db.delete(meal)
    db.commit()


@router.get("/summary", response_model=DailyNutritionSummary)
def daily_summary(
    log_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return today's calorie + macro summary for the dashboard."""
    target_date = log_date or _today()
    meals = (
        db.query(Meal)
        .filter(Meal.user_id == current_user.id, Meal.log_date == target_date)
        .all()
    )
    total_calories = sum(m.calories for m in meals)
    return DailyNutritionSummary(
        log_date=target_date,
        total_calories=total_calories,
        total_protein_g=sum(m.protein_g for m in meals),
        total_carbs_g=sum(m.carbs_g for m in meals),
        total_fat_g=sum(m.fat_g for m in meals),
        meal_count=len(meals),
        calorie_goal=current_user.calorie_goal,
        calories_remaining=max(0, current_user.calorie_goal - total_calories),
        meals=meals,
    )
