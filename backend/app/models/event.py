from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from datetime import datetime
from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    event_type = Column(String)
    source = Column(String)
    content = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    duration_seconds = Column(Integer, default=0)
