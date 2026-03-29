from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    total_sessions = Column(Integer, default=0)
    total_minutes = Column(Float, default=0.0)
