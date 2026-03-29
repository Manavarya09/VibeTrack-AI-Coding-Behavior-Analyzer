from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.session import Session as SessionModel
from app.models.event import Event as EventModel

router = APIRouter()


class AdminStats(BaseModel):
    total_users: int
    total_sessions: int
    total_events: int
    avg_session_length: float
    active_sessions_today: int
    new_users_today: int
    system_health: dict


class UserAdminResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    is_admin: bool
    total_sessions: int
    total_minutes: float
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/admin/stats", response_model=AdminStats)
def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_sessions = db.query(SessionModel).count()
    total_events = db.query(EventModel).count()

    sessions = db.query(SessionModel).all()
    avg_length = (
        sum(s.duration_minutes for s in sessions) / len(sessions) if sessions else 0
    )

    today = datetime.utcnow().date()
    active_today = (
        db.query(SessionModel)
        .filter(
            func.date(SessionModel.start_time) == today, SessionModel.is_active == True
        )
        .count()
    )

    new_today = db.query(User).filter(func.date(User.created_at) == today).count()

    return {
        "total_users": total_users,
        "total_sessions": total_sessions,
        "total_events": total_events,
        "avg_session_length": round(avg_length, 2),
        "active_sessions_today": active_today,
        "new_users_today": new_today,
        "system_health": {
            "database": "healthy",
            "api": "healthy",
            "websocket": "healthy",
        },
    }


@router.get("/admin/users", response_model=List[UserAdminResponse])
def get_all_users(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.put("/admin/users/{user_id}/toggle-active")
def toggle_user_active(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()

    return {"message": f"User active status: {user.is_active}"}


@router.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.query(SessionModel).filter(SessionModel.user_id == user_id).delete()
    db.query(EventModel).filter(EventModel.user_id == user_id).delete()
    db.delete(user)
    db.commit()

    return {"message": "User deleted"}
