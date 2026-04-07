from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    text = Column(String, nullable=False)
    category = Column(String, default="habit")   # habit | activity | nutrition | sleep | mindset
    completed = Column(Boolean, default=False)

    # When the task was generated / assigned
    task_date = Column(Date, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="tasks")
