"""
VibeTrack - AI Coding Behavior Analyzer
Advanced Python Backend with ML, Analytics, and Real-time Processing
"""

from fastapi import (
    FastAPI,
    Request,
    WebSocket,
    WebSocketDisconnect,
    Depends,
    HTTPException,
    BackgroundTasks,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Any, Union, Callable
from datetime import datetime, timedelta, timezone
from enum import Enum
from contextlib import asynccontextmanager
from functools import wraps, lru_cache
from dataclasses import dataclass, field
from collections import defaultdict, deque
import asyncio
import hashlib
import hmac
import json
import logging
import time
import uuid
import secrets
import statistics
import re
import os
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout), logging.FileHandler("vibetrack.log")],
)
logger = logging.getLogger(__name__)

# ============================================================================
# ENUMS AND CONSTANTS
# ============================================================================


class EventType(str, Enum):
    PROMPT = "prompt"
    BREAK = "break"
    ACTIVITY = "activity"
    TAB_FOCUS = "tab_focus"
    IDLE = "idle"
    ACTIVE = "active"


class SessionSource(str, Enum):
    WEB = "web"
    DESKTOP = "desktop"
    CHROME = "chrome"
    API = "api"


class Classification(str, Enum):
    NORMAL = "Normal"
    DEEP_FLOW = "Deep Flow"
    HIGH_DEPENDENCY = "High Dependency"


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"


# ============================================================================
# ADVANCED DATA MODELS
# ============================================================================


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)

    @validator("password")
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    settings: Optional[Dict[str, Any]] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    total_sessions: int
    total_minutes: float
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class SessionBase(BaseModel):
    user_id: int
    source: SessionSource = SessionSource.WEB


class SessionCreate(SessionBase):
    metadata: Optional[Dict[str, Any]] = None


class SessionUpdate(BaseModel):
    end_time: Optional[datetime] = None
    prompt_count: Optional[int] = Field(None, ge=0)
    break_time_minutes: Optional[float] = Field(None, ge=0)
    vibe_score: Optional[float] = Field(None, ge=0)
    classification: Optional[Classification] = None
    is_active: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None


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
    source: str

    class Config:
        from_attributes = True


class EventCreate(BaseModel):
    session_id: int
    user_id: int
    event_type: EventType
    source: SessionSource
    content: Optional[str] = None
    duration_seconds: int = 0
    metadata: Optional[Dict[str, Any]] = None


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


class StatsResponse(BaseModel):
    total_sessions: int
    total_minutes: float
    avg_session_minutes: float
    longest_session_minutes: float
    total_prompts: int
    total_break_minutes: float
    avg_break_per_session: float
    deep_flow_count: int
    high_dependency_count: int
    normal_count: int
    avg_vibe_score: Optional[float]


class PatternInsight(BaseModel):
    type: str
    title: str
    description: str
    confidence: float
    recommendations: List[str]


class MLPatternsResponse(BaseModel):
    patterns: List[PatternInsight]
    summary: Dict[str, Any]


class RecommendationResponse(BaseModel):
    type: str
    priority: str
    message: str
    action: Optional[str]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: Optional[str] = None


# ============================================================================
# ADVANCED DATABASE MODELS
# ============================================================================

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Float,
    Boolean,
    Text,
    ForeignKey,
    Index,
    JSON,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    role = Column(SQLEnum(UserRole), default=UserRole.USER)

    total_sessions = Column(Integer, default=0)
    total_minutes = Column(Float, default=0.0)

    settings = Column(JSON, default=dict)
    preferences = Column(JSON, default=dict)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    last_login = Column(DateTime, nullable=True)

    sessions = relationship(
        "Session", back_populates="user", cascade="all, delete-orphan"
    )
    events = relationship("Event", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_user_email_active", "email", "is_active"),
        Index("idx_user_created_at", "created_at"),
    )


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    start_time = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Float, default=0.0)

    prompt_count = Column(Integer, default=0)
    break_time_minutes = Column(Float, default=0.0)

    vibe_score = Column(Float, nullable=True)
    classification = Column(SQLEnum(Classification), default=Classification.NORMAL)

    is_active = Column(Boolean, default=True)
    source = Column(SQLEnum(SessionSource), default=SessionSource.WEB)

    metadata = Column(JSON, default=dict)
    tags = Column(JSON, default=list)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="sessions")
    events = relationship(
        "Event", back_populates="session", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_session_user_active", "user_id", "is_active"),
        Index("idx_session_start_time", "start_time"),
    )


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    event_type = Column(SQLEnum(EventType), nullable=False, index=True)
    source = Column(SQLEnum(SessionSource), default=SessionSource.WEB)

    content = Column(Text, nullable=True)
    duration_seconds = Column(Integer, default=0)

    timestamp = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )

    metadata = Column(JSON, default=dict)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session = relationship("Session", back_populates="events")
    user = relationship("User", back_populates="events")

    __table_args__ = (
        Index("idx_event_session_timestamp", "session_id", "timestamp"),
        Index("idx_event_user_type", "user_id", "event_type"),
    )


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String(100), nullable=False)
    key_hash = Column(String(255), nullable=False)
    key_prefix = Column(String(20), nullable=False)

    is_active = Column(Boolean, default=True)

    expires_at = Column(DateTime, nullable=True)
    last_used = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (Index("idx_api_key_user_active", "user_id", "is_active"),)


class Webhook(Base):
    __tablename__ = "webhooks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    url = Column(String(500), nullable=False)
    event_type = Column(String(50), nullable=False)

    secret = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_triggered = Column(DateTime, nullable=True)


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    is_public = Column(Boolean, default=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    role = Column(String(50), default="member")
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# ============================================================================
# DATABASE ENGINE
# ============================================================================

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session as DBSession
from contextlib import contextmanager

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vibetrack.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> DBSession:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully")


# ============================================================================
# SECURITY SERVICES
# ============================================================================


class SecurityService:
    """Advanced security service for authentication and authorization"""

    @staticmethod
    def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
        """Hash password with salt using bcrypt"""
        import bcrypt

        if salt is None:
            salt = bcrypt.gensalt()
        else:
            salt = salt.encode()
        hashed = bcrypt.hashpw(password.encode(), salt)
        return hashed.decode(), salt.decode()

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify password against hash"""
        import bcrypt

        try:
            return bcrypt.checkpw(password.encode(), hashed.encode())
        except:
            return False

    @staticmethod
    def generate_token(length: int = 32) -> str:
        """Generate secure random token"""
        return secrets.token_urlsafe(length)

    @staticmethod
    def generate_api_key() -> tuple[str, str]:
        """Generate API key and hash"""
        key = f"vk_{secrets.token_urlsafe(32)}"
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        return key, key_hash

    @staticmethod
    def create_jwt_token(
        data: Dict, secret: str, expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT token"""
        from jose import jwt

        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=30)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, secret, algorithm="HS256")

    @staticmethod
    def verify_jwt_token(token: str, secret: str) -> Optional[Dict]:
        """Verify JWT token"""
        from jose import jwt, JWTError

        try:
            return jwt.decode(token, secret, algorithms=["HS256"])
        except JWTError:
            return None

    @staticmethod
    def generate_csrf_token() -> str:
        """Generate CSRF token"""
        return secrets.token_urlsafe(32)

    @staticmethod
    def verify_csrf_token(token: str, expected: str) -> bool:
        """Verify CSRF token"""
        return hmac.compare_digest(token, expected)


security = SecurityService()

# ============================================================================
# VIBE SCORE ENGINE
# ============================================================================


class VibeScoreEngine:
    """
    Advanced Vibe Score Calculation Engine

    Formula: Score = (duration_minutes * prompt_count) / (break_time_minutes + 1)

    Classifications:
    - Normal: < 100
    - Deep Flow: 100 - 499
    - High Dependency: >= 500
    """

    THRESHOLD_NORMAL = 100
    THRESHOLD_DEEP_FLOW = 500

    @classmethod
    def calculate(
        cls, duration_minutes: float, prompt_count: int, break_time_minutes: float
    ) -> float:
        """Calculate vibe score"""
        if duration_minutes <= 0:
            return 0.0

        score = (duration_minutes * prompt_count) / (break_time_minutes + 1)
        return round(score, 2)

    @classmethod
    def classify(
        cls, score: float, prompt_count: int = 0, duration_minutes: float = 0
    ) -> Classification:
        """Classify session based on score and context"""
        # Override based on context
        if score >= cls.THRESHOLD_DEEP_FLOW or (
            prompt_count > 50 and duration_minutes > 120
        ):
            return Classification.HIGH_DEPENDENCY
        elif score >= cls.THRESHOLD_NORMAL or (
            prompt_count > 20 and duration_minutes > 60
        ):
            return Classification.DEEP_FLOW
        else:
            return Classification.NORMAL

    @classmethod
    def analyze(cls, session: Session) -> Dict[str, Any]:
        """Full analysis of a session"""
        score = cls.calculate(
            session.duration_minutes, session.prompt_count, session.break_time_minutes
        )
        classification = cls.classify(
            score, session.prompt_count, session.duration_minutes
        )

        return {
            "vibe_score": score,
            "classification": classification,
            "metrics": {
                "duration": session.duration_minutes,
                "prompts": session.prompt_count,
                "breaks": session.break_time_minutes,
                "prompts_per_minute": session.prompt_count
                / max(session.duration_minutes, 1),
                "break_frequency": session.break_time_minutes
                / max(session.duration_minutes, 1),
            },
        }


vibe_engine = VibeScoreEngine()

# ============================================================================
# ML INSIGHTS ENGINE
# ============================================================================


class MLInsightsEngine:
    """
    Machine Learning-based Insights Engine

    Provides pattern detection, predictions, and recommendations
    """

    def __init__(self):
        self.min_sessions_for_patterns = 3
        self.learning_rate = 0.1

    def detect_patterns(self, sessions: List[Session]) -> List[PatternInsight]:
        """Detect productivity patterns from session history"""
        if len(sessions) < self.min_sessions_for_patterns:
            return []

        patterns = []

        # Analyze hourly patterns
        hourly_pattern = self._analyze_hourly_patterns(sessions)
        if hourly_pattern:
            patterns.append(hourly_pattern)

        # Analyze break patterns
        break_pattern = self._analyze_break_patterns(sessions)
        if break_pattern:
            patterns.append(break_pattern)

        # Analyze dependency trends
        dependency_pattern = self._analyze_dependency_trend(sessions)
        if dependency_pattern:
            patterns.append(dependency_pattern)

        # Analyze engagement
        engagement_pattern = self._analyze_engagement(sessions)
        if engagement_pattern:
            patterns.append(engagement_pattern)

        return patterns

    def _analyze_hourly_patterns(
        self, sessions: List[Session]
    ) -> Optional[PatternInsight]:
        """Analyze productivity by hour"""
        hour_counts = defaultdict(lambda: {"count": 0, "minutes": 0})

        for session in sessions:
            if session.start_time:
                hour = session.start_time.hour
                hour_counts[hour]["count"] += 1
                hour_counts[hour]["minutes"] += session.duration_minutes

        if not hour_counts:
            return None

        # Find peak hours
        peak_hours = sorted(
            hour_counts.items(), key=lambda x: x[1]["minutes"], reverse=True
        )[:3]

        peak_hour_names = [self._hour_to_name(h[0]) for h in peak_hours]

        return PatternInsight(
            type="peak_performance",
            title="Peak Productivity Hours",
            description=f"Your most productive hours are {', '.join(peak_hour_names)}",
            confidence=0.75 if len(sessions) > 10 else 0.5,
            recommendations=[
                "Schedule complex tasks during peak hours",
                "Reserve mornings for deep work",
            ],
        )

    def _analyze_break_patterns(
        self, sessions: List[Session]
    ) -> Optional[PatternInsight]:
        """Analyze break patterns"""
        breaks = [s.break_time_minutes for s in sessions if s.break_time_minutes > 0]

        if not breaks:
            return PatternInsight(
                type="break_habits",
                title="No Break Data",
                description="Start taking breaks to get personalized insights",
                confidence=0.0,
                recommendations=["Enable break tracking"],
            )

        avg_break = statistics.mean(breaks)

        if avg_break < 5:
            desc = "You take very short breaks. Consider longer breaks for better productivity."
            priority = "high"
        elif avg_break < 15:
            desc = "Your break patterns are healthy. Keep it up!"
            priority = "low"
        else:
            desc = "You take longer breaks. Ensure they're spaced regularly."
            priority = "medium"

        return PatternInsight(
            type="break_habits",
            title="Break Patterns",
            description=desc,
            confidence=0.7,
            recommendations=[
                "Take 5-minute breaks every hour",
                "Use Pomodoro technique",
            ]
            if avg_break < 10
            else [],
        )

    def _analyze_dependency_trend(
        self, sessions: List[Session]
    ) -> Optional[PatternInsight]:
        """Analyze AI dependency trend"""
        if len(sessions) < 5:
            return None

        recent = sessions[:5]
        older = sessions[5:10]

        if not older:
            return None

        recent_dep = sum(
            1 for s in recent if s.classification == Classification.HIGH_DEPENDENCY
        )
        older_dep = sum(
            1 for s in older if s.classification == Classification.HIGH_DEPENDENCY
        )

        if recent_dep > older_dep:
            return PatternInsight(
                type="dependency_increasing",
                title="Increasing AI Dependency",
                description="Your AI dependency has been increasing",
                confidence=0.6,
                recommendations=[
                    "Try solving problems independently first",
                    "Use AI for learning, not just answers",
                ],
            )
        elif recent_dep < older_dep:
            return PatternInsight(
                type="dependency_decreasing",
                title="Improving Independence",
                description="Great progress! You're becoming more independent",
                confidence=0.6,
                recommendations=["Keep challenging yourself to code without AI"],
            )

        return None

    def _analyze_engagement(self, sessions: List[Session]) -> Optional[PatternInsight]:
        """Analyze overall engagement"""
        if not sessions:
            return None

        avg_duration = statistics.mean(s.duration_minutes for s in sessions)
        avg_prompts = statistics.mean(s.prompt_count for s in sessions)

        if avg_duration > 120 and avg_prompts > 30:
            return PatternInsight(
                type="high_engagement",
                title="High Engagement",
                description="You have long, intensive coding sessions",
                confidence=0.7,
                recommendations=["Consider splitting long sessions"],
            )

        return None

    def _hour_to_name(self, hour: int) -> str:
        """Convert hour to name"""
        if 6 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 21:
            return "evening"
        else:
            return "night"

    def predict_session(
        self, duration: float, prompts: int, breaks: float
    ) -> Dict[str, Any]:
        """Predict session outcome"""
        score = vibe_engine.calculate(duration, prompts, breaks)
        classification = vibe_engine.classify(score, prompts, duration)

        confidence = min(0.5 + (duration / 360), 0.9)

        return {
            "predicted_classification": classification,
            "predicted_score": score,
            "confidence": confidence,
        }


ml_engine = MLInsightsEngine()

# ============================================================================
# REAL-TIME WEBSOCKET MANAGER
# ============================================================================


class ConnectionManager:
    """WebSocket connection manager for real-time updates"""

    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = defaultdict(list)
        self.user_sessions: Dict[int, int] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id].append(websocket)
        logger.info(
            f"WebSocket connected: user={user_id}, total={len(self.active_connections[user_id])}"
        )

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"WebSocket disconnected: user={user_id}")

    async def send_personal(self, message: Dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message: {e}")

    async def broadcast(self, message: Dict, exclude: List[int] = None):
        exclude = exclude or []
        for user_id, connections in self.active_connections.items():
            if user_id not in exclude:
                for connection in connections:
                    try:
                        await connection.send_json(message)
                    except Exception as e:
                        logger.error(f"Error broadcasting: {e}")


ws_manager = ConnectionManager()

# ============================================================================
# CACHE SERVICE
# ============================================================================


class CacheService:
    """In-memory cache with TTL support"""

    def __init__(self, default_ttl: int = 300):
        self.cache: Dict[str, tuple] = {}
        self.default_ttl = default_ttl

    def get(self, key: str) -> Optional[Any]:
        if key in self.cache:
            value, timestamp = self.cache[key]
            if time.time() - timestamp < self.default_ttl:
                return value
            del self.cache[key]
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        self.cache[key] = (value, time.time())

    def delete(self, key: str):
        if key in self.cache:
            del self.cache[key]

    def clear(self):
        self.cache.clear()

    def cached(self, prefix: str, ttl: Optional[int] = None):
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                cache_key = f"{prefix}:{args}:{sorted(kwargs.items())}"
                cached = self.get(cache_key)
                if cached is not None:
                    return cached
                result = await func(*args, **kwargs)
                self.set(cache_key, result, ttl)
                return result

            return wrapper

        return decorator


cache = CacheService()

# ============================================================================
# RATE LIMITER
# ============================================================================


class RateLimiter:
    """Rate limiting service"""

    def __init__(self):
        self.requests: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))

    def check(self, key: str, limit: int = 100, window: int = 60) -> bool:
        now = time.time()

        # Clean old requests
        while self.requests[key] and now - self.requests[key][0] > window:
            self.requests[key].popleft()

        if len(self.requests[key]) >= limit:
            return False

        self.requests[key].append(now)
        return True

    def get_remaining(self, key: str, limit: int = 100) -> int:
        now = time.time()

        while self.requests[key] and now - self.requests[key][0] > 60:
            self.requests[key].popleft()

        return max(0, limit - len(self.requests[key]))


rate_limiter = RateLimiter()

# ============================================================================
# METRICS COLLECTOR
# ============================================================================


class MetricsCollector:
    """Application metrics collector"""

    def __init__(self):
        self.request_count = 0
        self.error_count = 0
        self.response_times: deque = deque(maxlen=10000)
        self.start_time = time.time()
        self.endpoint_stats: Dict[str, Dict] = defaultdict(
            lambda: {"count": 0, "errors": 0, "total_time": 0.0}
        )

    def record_request(self, endpoint: str, method: str, status: int, duration: float):
        self.request_count += 1
        self.response_times.append(duration)

        if status >= 400:
            self.error_count += 1

        key = f"{method}:{endpoint}"
        self.endpoint_stats[key]["count"] += 1
        if status >= 400:
            self.endpoint_stats[key]["errors"] += 1
        self.endpoint_stats[key]["total_time"] += duration

    def get_metrics(self) -> Dict[str, Any]:
        uptime = time.time() - self.start_time
        avg_response = (
            statistics.mean(self.response_times) if self.response_times else 0
        )

        return {
            "uptime_seconds": round(uptime, 2),
            "total_requests": self.request_count,
            "total_errors": self.error_count,
            "error_rate": round(self.error_count / max(self.request_count, 1) * 100, 2),
            "requests_per_second": round(self.request_count / max(uptime, 1), 2),
            "avg_response_time_ms": round(avg_response * 1000, 2),
            "endpoints": dict(self.endpoint_stats),
        }


metrics = MetricsCollector()

# ============================================================================
# AUDIT LOG
# ============================================================================


class AuditLog:
    """Audit logging service"""

    def __init__(self, max_entries: int = 10000):
        self.logs: deque = deque(maxlen=max_entries)

    def log(
        self,
        action: str,
        user_id: int,
        details: Optional[Dict] = None,
        ip: Optional[str] = None,
    ):
        entry = {
            "id": len(self.logs) + 1,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": action,
            "user_id": user_id,
            "details": details or {},
            "ip": ip,
        }
        self.logs.append(entry)
        logger.info(f"Audit: {action} by user {user_id}")

    def get_logs(self, user_id: Optional[int] = None, limit: int = 100) -> List[Dict]:
        logs = list(self.logs)
        if user_id:
            logs = [l for l in logs if l["user_id"] == user_id]
        return logs[-limit:]

    def search(self, query: str) -> List[Dict]:
        return [l for l in self.logs if query.lower() in str(l).lower()]


audit_log = AuditLog()

# ============================================================================
# WEBHOOK MANAGER
# ============================================================================


class WebhookManager:
    """Webhook management service"""

    def __init__(self):
        self.webhooks: Dict[str, List[Dict]] = defaultdict(list)

    def register(self, event_type: str, url: str, secret: Optional[str] = None) -> bool:
        webhook = {
            "url": url,
            "secret": secret,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        if webhook not in self.webhooks[event_type]:
            self.webhooks[event_type].append(webhook)
            return True
        return False

    def unregister(self, event_type: str, url: str) -> bool:
        if event_type in self.webhooks:
            self.webhooks[event_type] = [
                w for w in self.webhooks[event_type] if w["url"] != url
            ]
            return True
        return False

    async def trigger(self, event_type: str, data: Dict) -> List[Dict]:
        results = []

        if event_type not in self.webhooks:
            return results

        import httpx

        for webhook in self.webhooks[event_type]:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    payload = {
                        "event": event_type,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "data": data,
                    }

                    response = await client.post(webhook["url"], json=payload)
                    results.append(
                        {
                            "url": webhook["url"],
                            "status": response.status_code,
                            "success": response.status_code < 400,
                        }
                    )
            except Exception as e:
                results.append(
                    {"url": webhook["url"], "error": str(e), "success": False}
                )

        return results


webhook_manager = WebhookManager()

# ============================================================================
# EXPORT SERVICE
# ============================================================================


class ExportService:
    """Data export service"""

    @staticmethod
    def to_csv(sessions: List[Session]) -> str:
        import csv
        import io

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(
            [
                "ID",
                "User ID",
                "Start Time",
                "End Time",
                "Duration (min)",
                "Prompts",
                "Break Time (min)",
                "Vibe Score",
                "Classification",
                "Source",
            ]
        )

        for s in sessions:
            writer.writerow(
                [
                    s.id,
                    s.user_id,
                    s.start_time,
                    s.end_time,
                    round(s.duration_minutes, 2),
                    s.prompt_count,
                    round(s.break_time_minutes, 2),
                    s.vibe_score,
                    s.classification.value if s.classification else None,
                    s.source.value if s.source else None,
                ]
            )

        return output.getvalue()

    @staticmethod
    def to_json(sessions: List[Session]) -> str:
        return json.dumps(
            [
                {
                    "id": s.id,
                    "user_id": s.user_id,
                    "start_time": s.start_time.isoformat() if s.start_time else None,
                    "end_time": s.end_time.isoformat() if s.end_time else None,
                    "duration_minutes": s.duration_minutes,
                    "prompt_count": s.prompt_count,
                    "break_time_minutes": s.break_time_minutes,
                    "vibe_score": s.vibe_score,
                    "classification": s.classification.value
                    if s.classification
                    else None,
                    "source": s.source.value if s.source else None,
                }
                for s in sessions
            ],
            indent=2,
        )

    @staticmethod
    def to_markdown(sessions: List[Session]) -> str:
        md = "# VibeTrack Session Report\n\n"
        md += (
            f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        )

        md += "## Summary\n\n"
        md += f"- Total Sessions: {len(sessions)}\n"
        md += f"- Total Minutes: {sum(s.duration_minutes for s in sessions):.2f}\n\n"

        md += "## Sessions\n\n"
        md += "| Date | Duration | Prompts | Vibe Score | Classification |\n"
        md += "|------|----------|---------|------------|----------------|\n"

        for s in sessions:
            date = s.start_time.strftime("%Y-%m-%d") if s.start_time else "N/A"
            md += f"| {date} | {s.duration_minutes:.0f}m | {s.prompt_count} | {s.vibe_score or 'N/A'} | {s.classification or 'N/A'} |\n"

        return md


export_service = ExportService()

# ============================================================================
# NOTIFICATION SERVICE
# ============================================================================


class NotificationService:
    """In-app notification service"""

    def __init__(self):
        self.notifications: Dict[int, List[Dict]] = defaultdict(list)

    def create(
        self, user_id: int, title: str, message: str, type: str = "info"
    ) -> Dict:
        notification = {
            "id": len(self.notifications[user_id]) + 1,
            "title": title,
            "message": message,
            "type": type,
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.notifications[user_id].append(notification)
        return notification

    def get_all(self, user_id: int, unread_only: bool = False) -> List[Dict]:
        notifications = self.notifications.get(user_id, [])
        if unread_only:
            notifications = [n for n in notifications if not n["read"]]
        return notifications

    def mark_read(self, user_id: int, notification_id: int) -> bool:
        for n in self.notifications.get(user_id, []):
            if n["id"] == notification_id:
                n["read"] = True
                return True
        return False

    def delete(self, user_id: int, notification_id: int) -> bool:
        if user_id in self.notifications:
            self.notifications[user_id] = [
                n for n in self.notifications[user_id] if n["id"] != notification_id
            ]
            return True
        return False


notifications = NotificationService()

# ============================================================================
# SENTIMENT ANALYZER
# ============================================================================


class SentimentAnalyzer:
    """Simple sentiment analysis for session content"""

    POSITIVE_WORDS = {
        "great",
        "excellent",
        "amazing",
        "love",
        "perfect",
        "awesome",
        "productive",
        "focused",
        "flow",
        "accomplished",
        "success",
        "happy",
    }

    NEGATIVE_WORDS = {
        "frustrated",
        "stuck",
        "confused",
        "tired",
        "burnout",
        "stressed",
        "overwhelmed",
        "failed",
        "error",
        "bug",
        "hard",
    }

    def analyze(self, content: str) -> Dict[str, Any]:
        if not content:
            return {"sentiment": "neutral", "score": 0.5}

        content_lower = content.lower()

        positive = sum(1 for word in self.POSITIVE_WORDS if word in content_lower)
        negative = sum(1 for word in self.NEGATIVE_WORDS if word in content_lower)

        total = positive + negative

        if total == 0:
            return {"sentiment": "neutral", "score": 0.5}

        score = positive / total

        if score > 0.6:
            sentiment = "positive"
        elif score < 0.4:
            sentiment = "negative"
        else:
            sentiment = "neutral"

        return {
            "sentiment": sentiment,
            "score": round(score, 2),
            "positive_count": positive,
            "negative_count": negative,
        }


sentiment_analyzer = SentimentAnalyzer()

# ============================================================================
# SCHEDULER SERVICE
# ============================================================================


class SchedulerService:
    """Background task scheduler"""

    def __init__(self):
        self.tasks: Dict[str, Callable] = {}

    def register(self, name: str, func: Callable):
        self.tasks[name] = func

    async def run_task(self, name: str, *args, **kwargs):
        if name in self.tasks:
            return await self.tasks[name](*args, **kwargs)
        raise ValueError(f"Task {name} not found")

    async def cleanup_inactive_sessions(
        self, db: DBSession, threshold_minutes: int = 30
    ):
        """Auto-end inactive sessions"""
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=threshold_minutes)

        inactive = (
            db.query(Session)
            .filter(Session.is_active == True, Session.start_time < cutoff)
            .all()
        )

        count = 0
        for session in inactive:
            session.end_time = datetime.now(timezone.utc)
            session.is_active = False

            if session.start_time:
                session.duration_minutes = (
                    session.end_time - session.start_time
                ).total_seconds() / 60

            # Calculate vibe score
            analysis = vibe_engine.analyze(session)
            session.vibe_score = analysis["vibe_score"]
            session.classification = analysis["classification"]

            count += 1

        db.commit()
        logger.info(f"Auto-ended {count} inactive sessions")
        return count


scheduler = SchedulerService()

# ============================================================================
# MAIN APPLICATION
# ============================================================================


# Create FastAPI app with lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting VibeTrack API...")
    init_db()
    logger.info("Database initialized")
    yield
    logger.info("Shutting down VibeTrack API...")


app = FastAPI(
    title="VibeTrack API",
    version="1.0.0",
    description="AI Coding Behavior Analyzer - Track your vibe coding sessions",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    metrics.record_request(
        request.url.path, request.method, response.status_code, duration
    )

    return response


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.exception_handler(SQLAlchemyError)
async def database_exception(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Database error occurred"})


# ============================================================================
# API ROUTES (Simplified Imports)
# ============================================================================

from app.api import (
    sessions,
    events,
    stats,
    users,
    analytics,
    reports,
    auth,
    ml,
    webhooks,
    teams,
    notifications,
    admin,
    metrics as metrics_api,
    api_keys,
    batch,
    activity,
    sentiment,
    recommendations,
)

# Include routers
app.include_router(sessions.router, prefix="/api", tags=["Sessions"])
app.include_router(events.router, prefix="/api", tags=["Events"])
app.include_router(stats.router, prefix="/api", tags=["Statistics"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(ml.router, prefix="/api", tags=["ML Insights"])
app.include_router(webhooks.router, prefix="/api", tags=["Webhooks"])
app.include_router(teams.router, prefix="/api", tags=["Teams"])
app.include_router(notifications.router, prefix="/api", tags=["Notifications"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])
app.include_router(metrics_api.router, prefix="/api", tags=["Metrics"])
app.include_router(api_keys.router, prefix="/api", tags=["API Keys"])
app.include_router(batch.router, prefix="/api", tags=["Batch"])
app.include_router(activity.router, prefix="/api", tags=["Activity"])
app.include_router(sentiment.router, prefix="/api", tags=["Sentiment"])
app.include_router(recommendations.router, prefix="/api", tags=["Recommendations"])


# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await ws_manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong", "timestamp": time.time()})
            elif message.get("type") == "session_update":
                await ws_manager.send_personal(
                    {"type": "session_update", "data": message.get("data")}, user_id
                )

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)


# Health check
@app.get("/")
async def root():
    return {"message": "VibeTrack API is running", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/metrics")
async def get_metrics():
    return metrics.get_metrics()


# sitemap
from app.services import sitemap

app.include_router(sitemap.router)

# System info
from app.api import system

app.include_router(system.router)

# Run the application
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
