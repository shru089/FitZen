from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class SleepLog(Base):
    __tablename__ = "sleep_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Duration (stored as float hours for easy math)
    hours_slept = Column(Float, nullable=False)
    sleep_quality = Column(Integer, nullable=True)  # 1–5 scale (1=terrible, 5=excellent)
    bedtime = Column(String, nullable=True)          # e.g. "22:30" – stored as string for simplicity
    wake_time = Column(String, nullable=True)        # e.g. "06:30"
    notes = Column(String, nullable=True)

    log_date = Column(Date, nullable=False)          # the morning date the sleep belongs to
    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="sleep_logs")
