"""
Sanctuary — AI Health Coach Backend
FastAPI application entry point.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# ─── Import all models so SQLAlchemy registers them with Base ────────────────
from database import Base, engine
import models.user        # noqa: F401
import models.nutrition   # noqa: F401
import models.activity    # noqa: F401
import models.sleep       # noqa: F401
import models.task        # noqa: F401
import models.hydration   # noqa: F401

# ─── Create tables ───────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Sanctuary API",
    description="Private AI health coach — guides you daily, not just tracks.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.nutrition import router as nutrition_router
from routers.activity import router as activity_router
from routers.sleep import router as sleep_router
from routers.tasks import router as tasks_router
from routers.coaching import router as coaching_router
from routers.progress import router as progress_router
from routers.hydration import router as hydration_router

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(nutrition_router)
app.include_router(activity_router)
app.include_router(sleep_router)
app.include_router(tasks_router)
app.include_router(coaching_router)
app.include_router(progress_router)
app.include_router(hydration_router)


# ─── Health check ────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "message": "Sanctuary API is running 🌿",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
