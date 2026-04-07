import sys
import os
from pathlib import Path
from uuid import uuid4
from fastapi.testclient import TestClient

# Add backend root to sys.path so we can import 'main'
backend_root = Path(__file__).parent.parent
sys.path.append(str(backend_root))

from main import app

client = TestClient(app)


def req(method, path, body=None, token=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    response = client.request(method, path, json=body, headers=headers)
    print(f"{method} {path} -> {response.status_code}")
    data = response.json() if response.content else None
    return data, response.status_code


email = f"alex-{uuid4().hex[:8]}@sanctuary.app"

# 1. Register
res, status = req("POST", "/api/auth/register", {
    "name": "Alex",
    "email": email,
    "password": "test123",
})
assert status == 201, f"Register failed: {res}"
token = res["access_token"]
print("  Token:", token[:30] + "...")
print("  User:", res["user"]["name"], "|", res["user"]["email"])

# 2. Log a meal
meal, status = req("POST", "/api/nutrition/meals", {
    "name": "Oatmeal",
    "meal_type": "breakfast",
    "calories": 320,
    "protein_g": 12,
}, token)
assert status == 201, f"Meal logging failed: {meal}"
print("  Meal logged:", meal["name"], meal["calories"], "kcal")

# 3. Log and update a workout
workout, status = req("POST", "/api/activity/workouts", {
    "name": "Morning Run",
    "activity_type": "cardio",
    "duration_minutes": 30,
    "calories_burned": 280,
    "completed": False,
}, token)
assert status == 201, f"Workout logging failed: {workout}"
print("  Workout logged:", workout["name"], workout["duration_minutes"], "min")

updated_workout, status = req("PUT", f"/api/activity/workouts/{workout['id']}", {
    "completed": True,
    "intensity": "high",
}, token)
assert status == 200, f"Workout update failed: {updated_workout}"
assert updated_workout["completed"] is True
assert updated_workout["intensity"] == "high"

# 4. Verify activity summary counts only completed workouts
summary, status = req("GET", "/api/activity/summary", token=token)
assert status == 200, f"Activity summary failed: {summary}"
assert summary["completed_count"] == 1, f"Unexpected completed count: {summary}"
assert summary["total_duration_minutes"] == 30, f"Unexpected duration total: {summary}"
print("  Activity summary:", summary["completed_count"], "completed,", summary["total_duration_minutes"], "min")

# 5. Log sleep
sleep_log, status = req("POST", "/api/sleep/logs", {
    "hours_slept": 7.5,
    "sleep_quality": 4,
}, token)
assert status == 201, f"Sleep logging failed: {sleep_log}"
print("  Sleep logged:", sleep_log["hours_slept"], "hrs, quality", sleep_log["sleep_quality"])

# 6. Get dashboard
dash, status = req("GET", "/api/coaching/dashboard", token=token)
assert status == 200, f"Dashboard failed: {dash}"
print("  Dashboard -> calories:", dash["calories_consumed"], "/", dash["calorie_goal"])
print("  Coaching suggestions:")
for suggestion in dash["coaching_suggestions"]:
    print("   [" + suggestion["priority"].upper() + "]", suggestion["title"])

print()
print("ALL TESTS PASSED")
