from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.sleep import SleepLog
from schemas.sleep import SleepCreate, SleepUpdate, SleepOut, WeeklySleepSummary
from auth_utils import get_current_user

router = APIRouter(prefix="/api/sleep", tags=["Sleep"])


def _today() -> date:
    return date.today()


@router.post("/logs", response_model=SleepOut, status_code=status.HTTP_201_CREATED)
def log_sleep(
    payload: SleepCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a sleep session."""
    log = SleepLog(
        user_id=current_user.id,
        hours_slept=payload.hours_slept,
        sleep_quality=payload.sleep_quality,
        bedtime=payload.bedtime,
        wake_time=payload.wake_time,
        notes=payload.notes,
        log_date=payload.log_date or _today(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/logs", response_model=list[SleepOut])
def list_sleep_logs(
    log_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_date = log_date or _today()
    return (
        db.query(SleepLog)
        .filter(SleepLog.user_id == current_user.id, SleepLog.log_date == target_date)
        .all()
    )


@router.get("/logs/{log_id}", response_model=SleepOut)
def get_sleep_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = db.query(SleepLog).filter(
        SleepLog.id == log_id, SleepLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Sleep log not found")
    return log


@router.put("/logs/{log_id}", response_model=SleepOut)
def update_sleep_log(
    log_id: int,
    payload: SleepUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = db.query(SleepLog).filter(
        SleepLog.id == log_id, SleepLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Sleep log not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(log, field, value)

    db.commit()
    db.refresh(log)
    return log


@router.delete("/logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sleep_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = db.query(SleepLog).filter(
        SleepLog.id == log_id, SleepLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Sleep log not found")
    db.delete(log)
    db.commit()


@router.get("/summary/weekly", response_model=WeeklySleepSummary)
def weekly_sleep_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the last 7 days of sleep data for progress view."""
    from datetime import timedelta
    today = _today()
    week_ago = today - timedelta(days=6)
    logs = (
        db.query(SleepLog)
        .filter(
            SleepLog.user_id == current_user.id,
            SleepLog.log_date >= week_ago,
            SleepLog.log_date <= today,
        )
        .order_by(SleepLog.log_date)
        .all()
    )
    avg_hours = round(float(sum(l.hours_slept for l in logs)) / float(len(logs)), 2) if logs else 0.0
    quality_logs = [l for l in logs if l.sleep_quality is not None]
    avg_quality = (
        round(float(sum(l.sleep_quality for l in quality_logs)) / float(len(quality_logs)), 1)
        if quality_logs else None
    )
    return WeeklySleepSummary(
        avg_hours=avg_hours,
        avg_quality=avg_quality,
        total_nights_logged=len(logs),
        logs=logs,
    )
