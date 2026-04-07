from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.activity import Activity
from schemas.activity import ActivityCreate, ActivityUpdate, ActivityOut, DailyActivitySummary
from auth_utils import get_current_user

router = APIRouter(prefix="/api/activity", tags=["Activity"])


def _today() -> date:
    return date.today()


@router.post("/workouts", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
def log_workout(
    payload: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a new workout / activity."""
    activity = Activity(
        user_id=current_user.id,
        name=payload.name,
        activity_type=payload.activity_type,
        duration_minutes=payload.duration_minutes,
        calories_burned=payload.calories_burned or 0,
        intensity=payload.intensity or "moderate",
        notes=payload.notes,
        completed=payload.completed or False,
        log_date=payload.log_date or _today(),
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.get("/workouts", response_model=list[ActivityOut])
def list_workouts(
    log_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_date = log_date or _today()
    return (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id, Activity.log_date == target_date)
        .order_by(Activity.logged_at)
        .all()
    )


@router.get("/workouts/{workout_id}", response_model=ActivityOut)
def get_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    activity = db.query(Activity).filter(
        Activity.id == workout_id, Activity.user_id == current_user.id
    ).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Workout not found")
    return activity


@router.put("/workouts/{workout_id}", response_model=ActivityOut)
def update_workout(
    workout_id: int,
    payload: ActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    activity = db.query(Activity).filter(
        Activity.id == workout_id, Activity.user_id == current_user.id
    ).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Workout not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)

    db.commit()
    db.refresh(activity)
    return activity


@router.patch("/workouts/{workout_id}/complete", response_model=ActivityOut)
def toggle_complete(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle the completed status of a workout."""
    activity = db.query(Activity).filter(
        Activity.id == workout_id, Activity.user_id == current_user.id
    ).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Workout not found")

    activity.completed = not activity.completed
    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/workouts/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    activity = db.query(Activity).filter(
        Activity.id == workout_id, Activity.user_id == current_user.id
    ).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Workout not found")
    db.delete(activity)
    db.commit()


@router.get("/summary", response_model=DailyActivitySummary)
def daily_summary(
    log_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return today's workout summary for the dashboard."""
    target_date = log_date or _today()
    activities = (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id, Activity.log_date == target_date)
        .all()
    )
    completed = [a for a in activities if a.completed]
    total = len(activities)
    return DailyActivitySummary(
        log_date=target_date,
        total_duration_minutes=sum(a.duration_minutes for a in completed),
        total_calories_burned=sum(a.calories_burned for a in completed),
        completed_count=len(completed),
        total_count=total,
        completion_rate=round(float(len(completed)) / float(total) * 100.0 if total else 0.0, 1),
        activities=activities,
    )
