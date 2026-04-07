from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.nutrition import Meal
from models.activity import Activity
from models.sleep import SleepLog
from models.task import Task
from schemas.coaching import DashboardData, CoachingSuggestion
from coaching.engine import get_suggestions
from auth_utils import get_current_user

router = APIRouter(prefix="/api/coaching", tags=["Coaching"])


@router.get("/suggestions", response_model=list[CoachingSuggestion])
def coaching_suggestions(
    log_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return up to 3 personalized coaching suggestions for today."""
    target_date = log_date or date.today()
    return get_suggestions(current_user, db, target_date)


@router.get("/dashboard", response_model=DashboardData)
def dashboard(
    log_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Aggregated dashboard data: today's nutrition, activity, sleep,
    streak, tasks, and coaching suggestions — one single endpoint
    for the frontend Dashboard page.
    """
    target_date = log_date or date.today()

    # Nutrition
    meals = db.query(Meal).filter(
        Meal.user_id == current_user.id, Meal.log_date == target_date
    ).all()
    calories_consumed = sum(m.calories for m in meals)
    protein_g = sum(m.protein_g for m in meals)

    # Activity
    activities = db.query(Activity).filter(
        Activity.user_id == current_user.id, Activity.log_date == target_date
    ).all()
    completed_acts = [a for a in activities if a.completed]
    calories_burned = sum(a.calories_burned for a in completed_acts)
    total_workout_minutes = sum(a.duration_minutes for a in completed_acts)

    # Sleep
    sleep_log = db.query(SleepLog).filter(
        SleepLog.user_id == current_user.id, SleepLog.log_date == target_date
    ).order_by(SleepLog.logged_at.desc()).first()

    # Tasks
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id, Task.task_date == target_date
    ).all()
    tasks_completed = sum(1 for t in tasks if t.completed)

    # Coaching
    suggestions = get_suggestions(current_user, db, target_date)

    return DashboardData(
        date=target_date,
        calorie_goal=current_user.calorie_goal or 2000,
        calories_consumed=calories_consumed,
        calories_remaining=max(0, (current_user.calorie_goal or 2000) - calories_consumed),
        calories_burned=calories_burned,
        net_calories=calories_consumed - calories_burned,
        protein_g=protein_g,
        total_workout_minutes=total_workout_minutes,
        hours_slept=sleep_log.hours_slept if sleep_log else None,
        sleep_quality=sleep_log.sleep_quality if sleep_log else None,
        current_streak=current_user.current_streak or 0,
        coaching_suggestions=suggestions,
        tasks_today=len(tasks),
        tasks_completed=tasks_completed,
    )
