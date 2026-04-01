from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vibetrack.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

_tables_created = False


def ensure_tables():
    """Create all tables if they don't exist yet."""
    global _tables_created
    if not _tables_created:
        # Import all models to register them with Base.metadata
        import app.models.user  # noqa: F401
        import app.models.session  # noqa: F401
        import app.models.event  # noqa: F401
        import app.models.team  # noqa: F401
        Base.metadata.create_all(bind=engine)
        _tables_created = True


def get_db():
    ensure_tables()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
