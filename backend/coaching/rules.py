"""
Rule-based coaching rules for the Sanctuary AI coach.

Each rule is a function that takes the day's context (a dict of stats) and
returns a CoachingSuggestion if that rule fires, or None if it doesn't.
Rules are evaluated in order; the first N highest-priority fired rules are
returned to the user.
"""
from schemas.coaching import CoachingSuggestion


# ─── Nutrition Rules ─────────────────────────────────────────────────────────

def rule_no_meals_logged(ctx: dict):
    """If no meals have been logged today, remind the user."""
    if ctx["meal_count"] == 0:
        return CoachingSuggestion(
            category="nutrition",
            priority="high",
            icon="restaurant",
            title="Start tracking your meals",
            message="You haven't logged any meals today. Even logging breakfast helps build the habit!",
            action="Log first meal",
        )


def rule_close_to_calorie_goal(ctx: dict):
    """If user is within 200 kcal of goal, encourage them."""
    remaining = ctx["calories_remaining"]
    if 0 < remaining <= 200 and ctx["meal_count"] > 0:
        return CoachingSuggestion(
            category="nutrition",
            priority="high",
            icon="local_fire_department",
            title="Almost at your calorie goal!",
            message=f"Only {remaining} kcal left. You're very close — a light snack will do it.",
            action="Log a snack",
        )


def rule_over_calorie_goal(ctx: dict):
    """If user has exceeded their calorie goal."""
    if ctx["calories_consumed"] > ctx["calorie_goal"] and ctx["calorie_goal"] > 0:
        over = ctx["calories_consumed"] - ctx["calorie_goal"]
        return CoachingSuggestion(
            category="nutrition",
            priority="medium",
            icon="warning",
            title="Calorie goal exceeded",
            message=f"You're {over} kcal over your goal today. Try a lighter dinner or an evening walk to balance it out.",
            action="Log a workout",
        )


def rule_low_protein(ctx: dict):
    """If protein intake is below a reasonable floor (30g) by midday."""
    if ctx["protein_g"] < 30 and ctx["meal_count"] >= 1:
        return CoachingSuggestion(
            category="nutrition",
            priority="medium",
            icon="nutrition",
            title="Boost your protein",
            message="Your protein intake looks low. Try adding eggs, Greek yogurt, or chicken to your next meal.",
            action="Log a protein meal",
        )


# ─── Activity Rules ──────────────────────────────────────────────────────────

def rule_no_workout_logged(ctx: dict):
    """Encourage logging a workout if nothing is recorded."""
    if ctx["workout_count"] == 0:
        return CoachingSuggestion(
            category="activity",
            priority="medium",
            icon="fitness_center",
            title="Move your body today",
            message="No workout logged yet. Even a 10-minute walk counts — small steps lead to big changes.",
            action="Log a workout",
        )


def rule_great_workout_day(ctx: dict):
    """If the user has completed 45+ minutes, celebrate it."""
    if ctx["total_workout_minutes"] >= 45:
        return CoachingSuggestion(
            category="activity",
            priority="low",
            icon="emoji_events",
            title="Awesome workout day! 🎉",
            message=f"You've moved for {ctx['total_workout_minutes']} minutes today. That's incredible — keep it up!",
        )


def rule_balance_with_rest(ctx: dict):
    """If the user has done 90+ minutes of high activity, suggest recovery."""
    if ctx["total_workout_minutes"] >= 90:
        return CoachingSuggestion(
            category="activity",
            priority="low",
            icon="self_improvement",
            title="Don't forget to recover",
            message="Big effort today! Make sure you stretch and eat enough protein to help your muscles recover.",
        )


# ─── Sleep Rules ─────────────────────────────────────────────────────────────

def rule_no_sleep_logged(ctx: dict):
    if not ctx["hours_slept"]:
        return CoachingSuggestion(
            category="sleep",
            priority="low",
            icon="bedtime",
            title="Log your sleep",
            message="Track your sleep to get personalized coaching. Good rest is 50% of the health equation!",
            action="Log sleep",
        )


def rule_poor_sleep(ctx: dict):
    hours = ctx.get("hours_slept") or 0
    if 0 < hours < 6:
        return CoachingSuggestion(
            category="sleep",
            priority="high",
            icon="sleep_score",
            title="You need more rest",
            message=f"You only slept {hours:.1f} hours. Aim for 7–9 hours. Try going to bed 30 minutes earlier tonight.",
        )


def rule_excellent_sleep(ctx: dict):
    hours = ctx.get("hours_slept") or 0
    if hours >= 8:
        return CoachingSuggestion(
            category="sleep",
            priority="low",
            icon="star",
            title="Great sleep! ⭐",
            message=f"{hours:.1f} hours of rest — you're set up for a productive day. Make it count!",
        )


# ─── Streak Rules ────────────────────────────────────────────────────────────

def rule_streak_milestone(ctx: dict):
    streak = ctx.get("current_streak", 0)
    if streak > 0 and streak % 7 == 0:
        return CoachingSuggestion(
            category="general",
            priority="high",
            icon="local_fire_department",
            title=f"{streak}-day streak! 🔥",
            message=f"You've been consistent for {streak} days straight. That's real dedication — you're building a lifestyle!",
        )


def rule_first_day(ctx: dict):
    if ctx.get("current_streak", 0) == 0 and ctx["meal_count"] == 0:
        return CoachingSuggestion(
            category="general",
            priority="high",
            icon="spa",
            title="Welcome to Sanctuary 🌿",
            message="Today is day one of your wellness journey. Start simple — log one meal and one workout.",
            action="Log first meal",
        )


# ─── Hydration (placeholder — no water model yet) ───────────────────────────

def rule_hydration_reminder(ctx: dict):
    """General hydration nudge — appears when nothing more pressing fires."""
    return CoachingSuggestion(
        category="hydration",
        priority="low",
        icon="water_drop",
        title="Stay hydrated",
        message="Drinking enough water boosts energy and helps with hunger. Aim for 8 glasses today.",
    )


# ─── Ordered rule list ───────────────────────────────────────────────────────
# Rules are evaluated in order; highest-priority suggestions bubble up.
ALL_RULES = [
    rule_first_day,
    rule_streak_milestone,
    rule_poor_sleep,
    rule_over_calorie_goal,
    rule_close_to_calorie_goal,
    rule_no_meals_logged,
    rule_no_workout_logged,
    rule_low_protein,
    rule_excellent_sleep,
    rule_great_workout_day,
    rule_balance_with_rest,
    rule_no_sleep_logged,
    rule_hydration_reminder,  # always fires, acts as fallback
]
