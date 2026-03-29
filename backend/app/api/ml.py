from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.session import Session as SessionModel
from app.services.ml_insights import PatternDetector

router = APIRouter()
pattern_detector = PatternDetector()


@router.get("/ml/patterns")
def get_productivity_patterns(
    user_id: Optional[int] = None, db: Session = Depends(get_db)
):
    query = db.query(SessionModel)
    if user_id:
        query = query.filter(SessionModel.user_id == user_id)

    sessions = query.order_by(SessionModel.start_time.desc()).limit(20).all()

    session_data = [
        {
            "id": s.id,
            "start_time": s.start_time.isoformat() if s.start_time else None,
            "duration_minutes": s.duration_minutes,
            "prompt_count": s.prompt_count,
            "break_time_minutes": s.break_time_minutes,
            "classification": s.classification,
            "vibe_score": s.vibe_score,
        }
        for s in sessions
    ]

    return pattern_detector.detect_productivity_patterns(session_data)


@router.get("/ml/predict")
def predict_session_outcome(
    duration: float, prompt_count: int, break_minutes: float = 0
):
    session_data = {
        "duration_minutes": duration,
        "prompt_count": prompt_count,
        "break_time_minutes": break_minutes,
    }
    return pattern_detector.predict_session_outcome(session_data)
