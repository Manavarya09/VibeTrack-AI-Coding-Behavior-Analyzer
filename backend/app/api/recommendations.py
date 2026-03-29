from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.session import Session as SessionModel
from app.services.recommendations import recommendation_engine

router = APIRouter()


@router.get("/recommendations")
def get_recommendations(user_id: int = None, db: Session = Depends(get_db)):
    query = db.query(SessionModel)
    if user_id:
        query = query.filter(SessionModel.user_id == user_id)

    sessions = query.all()

    total_sessions = len(sessions)
    total_minutes = sum(s.duration_minutes for s in sessions)
    avg_length = total_minutes / total_sessions if total_sessions > 0 else 0

    high_dep_count = sum(1 for s in sessions if s.classification == "High Dependency")

    avg_break = (
        sum(s.break_time_minutes for s in sessions) / total_sessions
        if total_sessions > 0
        else 0
    )

    user_data = {
        "total_sessions": total_sessions,
        "avg_session_length": avg_length,
        "high_dependency_count": high_dep_count,
        "avg_break_per_session": avg_break,
        "peak_hours": [],
    }

    recommendations = recommendation_engine.generate_recommendations(user_data)

    return {"user_id": user_id, "recommendations": recommendations}


@router.get("/recommendations/session/{session_id}")
def get_session_recommendations(session_id: int, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()

    if not session:
        return {"error": "Session not found"}

    session_data = {
        "duration_minutes": session.duration_minutes,
        "prompt_count": session.prompt_count,
        "classification": session.classification,
        "break_time_minutes": session.break_time_minutes,
    }

    tips = recommendation_engine.get_personalized_tips(session_data)

    return {"session_id": session_id, "tips": tips}
