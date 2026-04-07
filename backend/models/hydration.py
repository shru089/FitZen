from sqlalchemy import Column, Integer, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class HydrationLog(Base):
    __tablename__ = "hydration_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    amount_ml = Column(Integer, nullable=False)   # water in milliliters
    log_date = Column(Date, nullable=False)      # the day this water belongs to
    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="hydration_logs")
