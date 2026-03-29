from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.event import Event as EventModel
from app.services.sentiment import sentiment_analyzer

router = APIRouter()


@router.get("/sentiment/session/{session_id}")
def analyze_session_sentiment(session_id: int, db: Session = Depends(get_db)):
    events = db.query(EventModel).filter(EventModel.session_id == session_id).all()

    event_data = [
        {
            "event_type": e.event_type,
            "content": e.content,
            "timestamp": e.timestamp.isoformat(),
        }
        for e in events
    ]

    mood = sentiment_analyzer.get_session_mood(event_data)

    return {"session_id": session_id, "mood": mood, "total_events": len(events)}


@router.get("/sentiment/user/{user_id}")
def analyze_user_sentiment(user_id: int, days: int = 7, db: Session = Depends(get_db)):
    from datetime import timedelta
    from app.models.session import Session as SessionModel

    cutoff = datetime.utcnow() - timedelta(days=days)

    sessions = (
        db.query(SessionModel)
        .filter(SessionModel.user_id == user_id, SessionModel.start_time >= cutoff)
        .all()
    )

    moods = []
    for session in sessions:
        events = db.query(EventModel).filter(EventModel.session_id == session.id).all()

        event_data = [
            {"event_type": e.event_type, "content": e.content} for e in events
        ]
        mood = sentiment_analyzer.get_session_mood(event_data)
        moods.append(mood)

    mood_counts = {"productive": 0, "neutral": 0, "struggling": 0}
    for mood in moods:
        mood_counts[mood] = mood_counts.get(mood, 0) + 1

    dominant_mood = (
        max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else "neutral"
    )

    return {
        "user_id": user_id,
        "period_days": days,
        "total_sessions": len(sessions),
        "mood_distribution": mood_counts,
        "dominant_mood": dominant_mood,
    }


from datetime import datetime
