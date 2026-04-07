from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class ActivityCreate(BaseModel):
    name: str = Field(..., min_length=1)
    activity_type: str = Field(..., pattern="^(cardio|strength|flexibility|sport|other)$")
    duration_minutes: int = Field(..., gt=0)
    calories_burned: Optional[int] = Field(0, ge=0)
    intensity: Optional[str] = Field("moderate", pattern="^(low|moderate|high)$")
    notes: Optional[str] = None
    completed: Optional[bool] = False
    log_date: Optional[date] = None


class ActivityUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    activity_type: Optional[str] = Field(None, pattern="^(cardio|strength|flexibility|sport|other)$")
    duration_minutes: Optional[int] = Field(None, gt=0)
    calories_burned: Optional[int] = Field(None, ge=0)
    intensity: Optional[str] = Field(None, pattern="^(low|moderate|high)$")
    notes: Optional[str] = None
    completed: Optional[bool] = None


class ActivityOut(BaseModel):
    id: int
    name: str
    activity_type: str
    duration_minutes: int
    calories_burned: int
    intensity: str
    notes: Optional[str]
    completed: bool
    log_date: date
    logged_at: datetime

    class Config:
        from_attributes = True


class DailyActivitySummary(BaseModel):
    log_date: date
    total_duration_minutes: int
    total_calories_burned: int
    completed_count: int
    total_count: int
    completion_rate: float
    activities: list[ActivityOut]
