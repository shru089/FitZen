from datetime import date, datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.task import Task
from schemas.task import TaskCreate, TaskUpdate, TaskOut
from auth_utils import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


def _today() -> date:
    return date.today()


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(
        user_id=current_user.id,
        text=payload.text,
        category=payload.category or "habit",
        task_date=payload.task_date or _today(),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("", response_model=list[TaskOut])
def list_tasks(
    task_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_date = task_date or _today()
    return (
        db.query(Task)
        .filter(Task.user_id == current_user.id, Task.task_date == target_date)
        .order_by(Task.created_at)
        .all()
    )


@router.patch("/{task_id}/complete", response_model=TaskOut)
def toggle_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle a task's completed status."""
    task = db.query(Task).filter(
        Task.id == task_id, Task.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = not task.completed
    task.completed_at = datetime.utcnow() if task.completed else None
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(
        Task.id == task_id, Task.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    if "completed" in update_data:
        task.completed_at = datetime.utcnow() if task.completed else None

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(
        Task.id == task_id, Task.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
