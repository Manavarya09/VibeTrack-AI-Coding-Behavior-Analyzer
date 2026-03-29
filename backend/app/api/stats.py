from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.session import Session as SessionModel
from app.models.event import Event as EventModel

router = APIRouter()


class StatsResponse(BaseModel):
    total_sessions: int
    total_minutes: float
    avg_session_minutes: float
    longest_session_minutes: float
    total_prompts: int
    total_break_minutes: float
    avg_break_per_session: float
    deep_flow_count: int
    high_dependency_count: int
    normal_count: int
    avg_vibe_score: Optional[float]


class DailyStats(BaseModel):
    date: str
    session_count: int
    total_minutes: float


@router.get("/stats", response_model=StatsResponse)
def get_stats(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(SessionModel)
    if user_id:
        query = query.filter(SessionModel.user_id == user_id)

    sessions = query.all()

    if not sessions:
        return StatsResponse(
            total_sessions=0,
            total_minutes=0,
            avg_session_minutes=0,
            longest_session_minutes=0,
            total_prompts=0,
            total_break_minutes=0,
            avg_break_per_session=0,
            deep_flow_count=0,
            high_dependency_count=0,
            normal_count=0,
            avg_vibe_score=None,
        )

    total_sessions = len(sessions)
    total_minutes = sum(s.duration_minutes for s in sessions)
    avg_session = total_minutes / total_sessions if total_sessions > 0 else 0
    longest = max((s.duration_minutes for s in sessions), default=0)
    total_prompts = sum(s.prompt_count for s in sessions)
    total_break = sum(s.break_time_minutes for s in sessions)
    avg_break = total_break / total_sessions if total_sessions > 0 else 0

    deep_flow = sum(1 for s in sessions if s.classification == "Deep Flow")
    high_dep = sum(1 for s in sessions if s.classification == "High Dependency")
    normal = sum(1 for s in sessions if s.classification == "Normal")

    vibe_scores = [s.vibe_score for s in sessions if s.vibe_score is not None]
    avg_vibe = sum(vibe_scores) / len(vibe_scores) if vibe_scores else None

    return StatsResponse(
        total_sessions=total_sessions,
        total_minutes=round(total_minutes, 2),
        avg_session_minutes=round(avg_session, 2),
        longest_session_minutes=round(longest, 2),
        total_prompts=total_prompts,
        total_break_minutes=round(total_break, 2),
        avg_break_per_session=round(avg_break, 2),
        deep_flow_count=deep_flow,
        high_dependency_count=high_dep,
        normal_count=normal,
        avg_vibe_score=round(avg_vibe, 2) if avg_vibe else None,
    )


@router.get("/stats/daily", response_model=List[DailyStats])
def get_daily_stats(
    days: int = 7, user_id: Optional[int] = None, db: Session = Depends(get_db)
):
    query = db.query(SessionModel)
    if user_id:
        query = query.filter(SessionModel.user_id == user_id)

    cutoff = datetime.utcnow() - timedelta(days=days)
    sessions = query.filter(SessionModel.start_time >= cutoff).all()

    daily_data = {}
    for session in sessions:
        date_key = session.start_time.strftime("%Y-%m-%d")
        if date_key not in daily_data:
            daily_data[date_key] = {"session_count": 0, "total_minutes": 0}
        daily_data[date_key]["session_count"] += 1
        daily_data[date_key]["total_minutes"] += session.duration_minutes

    result = [
        DailyStats(
            date=date,
            session_count=data["session_count"],
            total_minutes=round(data["total_minutes"], 2),
        )
        for date, data in sorted(daily_data.items())
    ]
    return result
