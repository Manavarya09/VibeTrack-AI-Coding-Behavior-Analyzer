from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.database import get_db
from app.models.event import Event as EventModel

router = APIRouter()


class EventCreate(BaseModel):
    session_id: int
    user_id: int
    event_type: str
    source: str
    content: Optional[str] = None
    duration_seconds: Optional[int] = 0


class EventResponse(BaseModel):
    id: int
    session_id: int
    user_id: int
    event_type: str
    source: str
    content: Optional[str]
    timestamp: datetime
    duration_seconds: int

    class Config:
        from_attributes = True


@router.post("/event", response_model=EventResponse)
def create_event(event_data: EventCreate, db: Session = Depends(get_db)):
    event = EventModel(
        session_id=event_data.session_id,
        user_id=event_data.user_id,
        event_type=event_data.event_type,
        source=event_data.source,
        content=event_data.content,
        timestamp=datetime.utcnow(),
        duration_seconds=event_data.duration_seconds,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/events", response_model=List[EventResponse])
def get_events(
    session_id: Optional[int] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(EventModel)
    if session_id:
        query = query.filter(EventModel.session_id == session_id)
    if user_id:
        query = query.filter(EventModel.user_id == user_id)
    return query.order_by(EventModel.timestamp.desc()).all()


@router.get("/event/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
