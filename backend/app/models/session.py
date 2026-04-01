from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey
from datetime import datetime
from app.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Float, default=0.0)
    prompt_count = Column(Integer, default=0)
    break_time_minutes = Column(Float, default=0.0)
    vibe_score = Column(Float, nullable=True)
    classification = Column(String, default="Normal")
    is_active = Column(Boolean, default=True)
    source = Column(String, default="web")
    created_at = Column(DateTime, default=datetime.utcnow)
