from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class SleepCreate(BaseModel):
    hours_slept: float = Field(..., gt=0, le=24)
    sleep_quality: Optional[int] = Field(None, ge=1, le=5)
    bedtime: Optional[str] = None    # e.g. "22:30"
    wake_time: Optional[str] = None  # e.g. "06:30"
    notes: Optional[str] = None
    log_date: Optional[date] = None


class SleepUpdate(BaseModel):
    hours_slept: Optional[float] = Field(None, gt=0, le=24)
    sleep_quality: Optional[int] = Field(None, ge=1, le=5)
    bedtime: Optional[str] = None
    wake_time: Optional[str] = None
    notes: Optional[str] = None


class SleepOut(BaseModel):
    id: int
    hours_slept: float
    sleep_quality: Optional[int]
    bedtime: Optional[str]
    wake_time: Optional[str]
    notes: Optional[str]
    log_date: date
    logged_at: datetime

    class Config:
        from_attributes = True


class WeeklySleepSummary(BaseModel):
    avg_hours: float
    avg_quality: Optional[float]
    total_nights_logged: int
    logs: list[SleepOut]
