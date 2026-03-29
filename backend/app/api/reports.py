from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.session import Session as SessionModel
from app.models.event import Event as EventModel

router = APIRouter()


@router.get("/reports/session/{session_id}/events")
def get_session_events(session_id: int, db: Session = Depends(get_db)):
    events = (
        db.query(EventModel)
        .filter(EventModel.session_id == session_id)
        .order_by(EventModel.timestamp.asc())
        .all()
    )

    return {
        "session_id": session_id,
        "events": [
            {
                "id": e.id,
                "event_type": e.event_type,
                "source": e.source,
                "content": e.content,
                "timestamp": e.timestamp.isoformat(),
                "duration_seconds": e.duration_seconds,
            }
            for e in events
        ],
    }


@router.get("/reports/user/{user_id}/activity")
def get_user_activity(
    user_id: int, days: int = Query(7, ge=1, le=90), db: Session = Depends(get_db)
):
    from datetime import datetime, timedelta

    cutoff = datetime.utcnow() - timedelta(days=days)

    sessions = (
        db.query(SessionModel)
        .filter(SessionModel.user_id == user_id, SessionModel.start_time >= cutoff)
        .all()
    )

    events = (
        db.query(EventModel)
        .filter(EventModel.user_id == user_id, EventModel.timestamp >= cutoff)
        .all()
    )

    return {
        "period_days": days,
        "total_sessions": len(sessions),
        "total_events": len(events),
        "total_minutes": sum(s.duration_minutes for s in sessions),
        "sessions": [
            {
                "id": s.id,
                "start_time": s.start_time.isoformat(),
                "end_time": s.end_time.isoformat() if s.end_time else None,
                "duration_minutes": s.duration_minutes,
                "prompt_count": s.prompt_count,
                "classification": s.classification,
            }
            for s in sessions
        ],
    }
