"""
Progress router — weekly / monthly trend data for charts (V2 ready).
MVP: returns 7-day rolling per-day data plus weekly averages for calories,
workout minutes, and sleep.
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.nutrition import Meal
from models.activity import Activity
from models.sleep import SleepLog
from auth_utils import get_current_user

router = APIRouter(prefix="/api/progress", tags=["Progress"])


class DayProgress(BaseModel):
    date: date
    calories_consumed: int
    calories_burned: int
    workout_minutes: int
    hours_slept: Optional[float] = None


class WeeklyProgress(BaseModel):
    days: list[DayProgress]
    avg_calories: float
    avg_workout_minutes: float
    avg_sleep_hours: float


@router.get("/weekly", response_model=WeeklyProgress)
def weekly_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WeeklyProgress:
    """Return the last 7 days of progress data for the progress charts."""
    today = date.today()
    days_data: list[DayProgress] = []

    for i in range(6, -1, -1):
        target = today - timedelta(days=i)

        meals = db.query(Meal).filter(
            Meal.user_id == current_user.id, Meal.log_date == target
        ).all()

        activities = db.query(Activity).filter(
            Activity.user_id == current_user.id,
            Activity.log_date == target,
            Activity.completed == True,  # noqa: E712
        ).all()

        sleep_log = (
            db.query(SleepLog)
            .filter(SleepLog.user_id == current_user.id, SleepLog.log_date == target)
            .order_by(SleepLog.logged_at.desc())
            .first()
        )

        days_data.append(
            DayProgress(
                date=target,
                calories_consumed=int(sum(m.calories for m in meals)),
                calories_burned=int(sum(a.calories_burned for a in activities)),
                workout_minutes=int(sum(a.duration_minutes for a in activities)),
                hours_slept=float(sleep_log.hours_slept) if sleep_log else None,
            )
        )

    # Weekly averages (only include days that have data to avoid skewing)
    cal_entries = [float(d.calories_consumed) for d in days_data if d.calories_consumed > 0]
    workout_entries = [float(d.workout_minutes) for d in days_data if d.workout_minutes > 0]
    sleep_entries = [d.hours_slept for d in days_data if d.hours_slept is not None]

    return WeeklyProgress(
        days=days_data,
        avg_calories=round(sum(cal_entries) / len(cal_entries), 1) if cal_entries else 0.0,
        avg_workout_minutes=round(sum(workout_entries) / len(workout_entries), 1) if workout_entries else 0.0,
        avg_sleep_hours=round(sum(sleep_entries) / len(sleep_entries), 2) if sleep_entries else 0.0,  # type: ignore[arg-type]
    )
