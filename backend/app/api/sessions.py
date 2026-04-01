from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.database import get_db
from app.models.session import Session as SessionModel
from app.services.vibe_score import calculate_vibe_score, classify_engagement

router = APIRouter()


class SessionCreate(BaseModel):
    user_id: int
    source: Optional[str] = "desktop"


class SessionUpdate(BaseModel):
    end_time: Optional[datetime] = None
    prompt_count: Optional[int] = None
    break_time_minutes: Optional[float] = None
    vibe_score: Optional[float] = None
    classification: Optional[str] = None
    is_active: Optional[bool] = None


class SessionResponse(BaseModel):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime]
    duration_minutes: float
    prompt_count: int
    break_time_minutes: float
    vibe_score: Optional[float]
    classification: str
    is_active: bool
    source: Optional[str] = "web"

    class Config:
        from_attributes = True


@router.post("/session/start", response_model=SessionResponse)
def start_session(session_data: SessionCreate, db: Session = Depends(get_db)):
    session = SessionModel(
        user_id=session_data.user_id,
        source=session_data.source or "web",
        start_time=datetime.utcnow(),
        is_active=True,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post("/session/end/{session_id}", response_model=SessionResponse)
def end_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.end_time = datetime.utcnow()
    session.is_active = False

    if session.start_time:
        duration = session.end_time - session.start_time
        session.duration_minutes = duration.total_seconds() / 60

    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions", response_model=List[SessionResponse])
def get_sessions(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(SessionModel)
    if user_id:
        query = query.filter(SessionModel.user_id == user_id)
    return query.order_by(SessionModel.start_time.desc()).all()


@router.get("/session/{session_id}", response_model=SessionResponse)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.put("/session/{session_id}", response_model=SessionResponse)
def update_session(
    session_id: int, update_data: SessionUpdate, db: Session = Depends(get_db)
):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(session, field, value)

    if session.end_time and session.start_time:
        duration = session.end_time - session.start_time
        session.duration_minutes = duration.total_seconds() / 60

    db.commit()
    db.refresh(session)
    return session


@router.post("/session/calculate-vibe/{session_id}", response_model=SessionResponse)
def calculate_session_vibe(session_id: int, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not session.end_time:
        raise HTTPException(status_code=400, detail="Session must be ended first")

    vibe_score = calculate_vibe_score(
        session.duration_minutes, session.prompt_count, session.break_time_minutes
    )
    classification = classify_engagement(
        vibe_score, session.prompt_count, session.duration_minutes
    )

    session.vibe_score = vibe_score
    session.classification = classification

    db.commit()
    db.refresh(session)
    return session
