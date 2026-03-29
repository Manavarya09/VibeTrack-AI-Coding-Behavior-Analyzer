from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.session import Session as SessionModel
from app.models.event import Event as EventModel
from app.services.vibe_score import calculate_vibe_score, classify_engagement


def auto_end_inactive_sessions(db: Session, threshold_minutes: int = 30):
    cutoff = datetime.utcnow() - timedelta(minutes=threshold_minutes)
    inactive_sessions = (
        db.query(SessionModel)
        .filter(SessionModel.is_active == True, SessionModel.start_time < cutoff)
        .all()
    )

    for session in inactive_sessions:
        session.end_time = datetime.utcnow()
        session.is_active = False
        duration = session.end_time - session.start_time
        session.duration_minutes = duration.total_seconds() / 60

        vibe_score = calculate_vibe_score(
            session.duration_minutes, session.prompt_count, session.break_time_minutes
        )
        classification = classify_engagement(
            vibe_score, session.prompt_count, session.duration_minutes
        )
        session.vibe_score = vibe_score
        session.classification = classification

    db.commit()
    return len(inactive_sessions)


def calculate_total_break_time(db: Session, session_id: int) -> float:
    events = (
        db.query(EventModel)
        .filter(EventModel.session_id == session_id, EventModel.event_type == "break")
        .all()
    )
    return sum(e.duration_seconds / 60 for e in events)


def get_session_event_count(db: Session, session_id: int) -> dict:
    events = db.query(EventModel).filter(EventModel.session_id == session_id).all()

    counts = {}
    for event in events:
        event_type = event.event_type
        counts[event_type] = counts.get(event_type, 0) + 1

    return counts
