from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String, nullable=False)
    meal_type = Column(String, nullable=False)   # breakfast | lunch | dinner | snack
    calories = Column(Integer, nullable=False)
    protein_g = Column(Float, default=0.0)
    carbs_g = Column(Float, default=0.0)
    fat_g = Column(Float, default=0.0)
    fiber_g = Column(Float, default=0.0)
    notes = Column(String, nullable=True)

    log_date = Column(Date, nullable=False)      # the day this meal belongs to
    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="meals")
