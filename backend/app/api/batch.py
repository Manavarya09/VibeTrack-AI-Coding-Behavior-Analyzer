from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.database import get_db
from app.models.session import Session as SessionModel
from app.models.event import Event as EventModel

router = APIRouter()


class BulkSessionCreate(BaseModel):
    sessions: List[dict]


class BulkEventCreate(BaseModel):
    events: List[dict]


@router.post("/batch/sessions")
def bulk_create_sessions(
    sessions_data: BulkSessionCreate, db: Session = Depends(get_db)
):
    created = []
    for session_data in sessions_data.sessions:
        session = SessionModel(
            user_id=session_data["user_id"],
            source=session_data.get("source", "api"),
            is_active=False,
        )
        db.add(session)
        created.append(session)

    db.commit()
    for session in created:
        db.refresh(session)

    return {"created": len(created), "sessions": [{"id": s.id} for s in created]}


@router.post("/batch/events")
def bulk_create_events(events_data: BulkEventCreate, db: Session = Depends(get_db)):
    created = []
    for event_data in events_data.events:
        event = EventModel(
            session_id=event_data["session_id"],
            user_id=event_data["user_id"],
            event_type=event_data["event_type"],
            source=event_data.get("source", "api"),
            content=event_data.get("content"),
            duration_seconds=event_data.get("duration_seconds", 0),
        )
        db.add(event)
        created.append(event)

    db.commit()
    for event in created:
        db.refresh(event)

    return {"created": len(created), "events": [{"id": e.id} for e in created]}


@router.delete("/batch/sessions")
def bulk_delete_sessions(session_ids: List[int], db: Session = Depends(get_db)):
    deleted = db.query(SessionModel).filter(SessionModel.id.in_(session_ids)).delete()
    db.commit()
    return {"deleted": deleted}


@router.post("/batch/analyze")
def batch_analyze_sessions(session_ids: List[int], db: Session = Depends(get_db)):
    from app.services.vibe_score import calculate_vibe_score, classify_engagement

    sessions = db.query(SessionModel).filter(SessionModel.id.in_(session_ids)).all()

    results = []
    for session in sessions:
        if session.end_time:
            vibe_score = calculate_vibe_score(
                session.duration_minutes,
                session.prompt_count,
                session.break_time_minutes,
            )
            classification = classify_engagement(
                vibe_score, session.prompt_count, session.duration_minutes
            )

            session.vibe_score = vibe_score
            session.classification = classification

            results.append(
                {
                    "session_id": session.id,
                    "vibe_score": vibe_score,
                    "classification": classification,
                }
            )

    db.commit()
    return {"analyzed": len(results), "results": results}
