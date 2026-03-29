import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

os.environ["DATABASE_URL"] = "sqlite:///./test_vibetrack.db"
os.environ["SECRET_KEY"] = "test-secret-key"


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    from app.database import engine, Base

    Base.metadata.create_all(bind=engine)
    yield
    if os.path.exists("test_vibetrack.db"):
        os.remove("test_vibetrack.db")
