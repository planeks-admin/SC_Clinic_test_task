import uuid
from typing import Any
from sqlmodel import func, select
from app.api.deps import CurrentUser, SessionDep
from app.models import Task, TaskCreate, TaskStatus, TaskUpdate, TasksPublic
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import select, Session


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=TasksPublic)
def read_tasks(
        session: SessionDep,
        title:str|None = None,
        skip: int = 0,
        limit: int = 100
)-> Any:
    """
    Return all Task objects with To Do status, optionally filtering by title substring.
    """
    count_statement = select(func.count()).select_from(Task)
    count = session.exec(count_statement).one()
    statement = (
        select(Task)
        .where(Task.status == TaskStatus.TODO)
        .order_by(Task.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    if title:
        statement = statement.where(Task.title.ilike(f"%{title}%"))
    tasks = session.exec(statement).all()

    return TasksPublic(data=tasks, count=count)


@router.post("/create", response_model=Task, status_code=201)
def create_task(
    *, session: SessionDep, task_in: TaskCreate
) -> Any:
    """
    Create new task.
    """
    task = Task.model_validate(task_in)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.put("/claim-task/{id}", response_model=Task)
def claim_task(
    *,
    session: SessionDep,
    id: uuid.UUID,
) -> Any:
    """
    Claim an existing Task by ID.
    [Changes the task.status to 'In Progress']
    """
    task = session.get(Task, id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = TaskStatus.IN_PROGRESS
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
