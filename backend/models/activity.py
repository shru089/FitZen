from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String, nullable=False)
    activity_type = Column(String, nullable=False)  # cardio | strength | flexibility | sport | other
    duration_minutes = Column(Integer, nullable=False)
    calories_burned = Column(Integer, default=0)
    intensity = Column(String, default="moderate")  # low | moderate | high
    notes = Column(String, nullable=True)
    completed = Column(Boolean, default=False)

    log_date = Column(Date, nullable=False)
    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="activities")
