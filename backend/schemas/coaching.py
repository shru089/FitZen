from pydantic import BaseModel
from typing import Optional
from datetime import date


class CoachingSuggestion(BaseModel):
    category: str          # nutrition | activity | sleep | hydration | mindset | general
    priority: str          # high | medium | low
    icon: str              # material-symbols icon name for frontend
    title: str
    message: str
    action: Optional[str] = None   # short CTA text


class DashboardData(BaseModel):
    date: date
    calorie_goal: int
    calories_consumed: int
    calories_remaining: int
    calories_burned: int
    net_calories: int
    protein_g: float
    total_workout_minutes: int
    hours_slept: Optional[float]
    sleep_quality: Optional[int]
    current_streak: int
    coaching_suggestions: list[CoachingSuggestion]
    tasks_today: int
    tasks_completed: int
