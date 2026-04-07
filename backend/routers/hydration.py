from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from database import get_db
from models import User, HydrationLog
from auth_utils import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/hydration", tags=["hydration"])

class HydrationCreate(BaseModel):
    amount_ml: int

class HydrationResponse(BaseModel):
    id: int
    amount_ml: int
    log_date: date

    class Config:
        from_attributes = True

@router.post("/log", response_model=HydrationResponse, status_code=status.HTTP_201_CREATED)
def log_water(hydration: HydrationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_log = HydrationLog(
        user_id=current_user.id,
        amount_ml=hydration.amount_ml,
        log_date=date.today()
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/daily", response_model=int)
def get_daily_total(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logs = db.query(HydrationLog).filter(
        HydrationLog.user_id == current_user.id,
        HydrationLog.log_date == date.today()
    ).all()
    return sum(log.amount_ml for log in logs)
