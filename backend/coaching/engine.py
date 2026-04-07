"""
Coaching engine: gathers the user's daily context and runs all rules,
returning the top suggestions ordered by priority.
"""
from datetime import date
from sqlalchemy.orm import Session

from models.user import User
from models.nutrition import Meal
from models.activity import Activity
from models.sleep import SleepLog
from schemas.coaching import CoachingSuggestion
from coaching.rules import ALL_RULES

PRIORITY_ORDER = {"high": 0, "medium": 1, "low": 2}
MAX_SUGGESTIONS = 3


def build_context(user: User, db: Session, target_date: date) -> dict:
    """Assemble the stats dict the rules will read."""
    meals = db.query(Meal).filter(
        Meal.user_id == user.id, Meal.log_date == target_date
    ).all()

    activities = db.query(Activity).filter(
        Activity.user_id == user.id, Activity.log_date == target_date
    ).all()

    sleep_log = db.query(SleepLog).filter(
        SleepLog.user_id == user.id, SleepLog.log_date == target_date
    ).order_by(SleepLog.logged_at.desc()).first()

    total_calories = sum(m.calories for m in meals)
    completed_activities = [a for a in activities if a.completed]

    return {
        # Nutrition
        "meal_count": len(meals),
        "calories_consumed": total_calories,
        "calorie_goal": user.calorie_goal or 2000,
        "calories_remaining": max(0, (user.calorie_goal or 2000) - total_calories),
        "protein_g": sum(m.protein_g for m in meals),
        # Activity
        "workout_count": len(activities),
        "total_workout_minutes": sum(a.duration_minutes for a in completed_activities),
        "calories_burned": sum(a.calories_burned for a in completed_activities),
        # Sleep
        "hours_slept": sleep_log.hours_slept if sleep_log else None,
        "sleep_quality": sleep_log.sleep_quality if sleep_log else None,
        # Streaks
        "current_streak": user.current_streak or 0,
    }


def get_suggestions(user: User, db: Session, target_date: date) -> list[CoachingSuggestion]:
    """Run all rules against today's context and return the top suggestions."""
    ctx = build_context(user, db, target_date)
    suggestions = []

    for rule in ALL_RULES:
        result = rule(ctx)
        if result is not None:
            suggestions.append(result)

    # Sort by priority and return top N
    suggestions.sort(key=lambda s: PRIORITY_ORDER.get(s.priority, 99))
    return list(suggestions[:MAX_SUGGESTIONS])  # type: ignore[index]
