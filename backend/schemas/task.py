from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class TaskCreate(BaseModel):
    text: str = Field(..., min_length=1)
    category: Optional[str] = Field("habit", pattern="^(habit|activity|nutrition|sleep|mindset)$")
    task_date: Optional[date] = None


class TaskUpdate(BaseModel):
    text: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, pattern="^(habit|activity|nutrition|sleep|mindset)$")
    completed: Optional[bool] = None


class TaskOut(BaseModel):
    id: int
    text: str
    category: str
    completed: bool
    task_date: date
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
