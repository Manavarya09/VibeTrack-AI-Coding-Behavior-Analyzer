import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

os.environ["DATABASE_URL"] = "sqlite:///./test_vibetrack.db"
os.environ["SECRET_KEY"] = "test-secret-key"

from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def client():
    from app.database import engine, Base
    from main import app

    Base.metadata.create_all(bind=engine)

    with TestClient(app) as test_client:
        yield test_client

    if os.path.exists("test_vibetrack.db"):
        os.remove("test_vibetrack.db")


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_create_session(client):
    response = client.post("/api/session/start", json={"user_id": 1, "source": "test"})
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["user_id"] == 1
    assert data["is_active"] == True


def test_end_session(client):
    start_response = client.post(
        "/api/session/start", json={"user_id": 1, "source": "test"}
    )
    session_id = start_response.json()["id"]

    end_response = client.post(f"/api/session/end/{session_id}")
    assert end_response.status_code == 200
    data = end_response.json()
    assert data["is_active"] == False


def test_log_event(client):
    session_response = client.post(
        "/api/session/start", json={"user_id": 1, "source": "test"}
    )
    session_id = session_response.json()["id"]

    event_response = client.post(
        "/api/event",
        json={
            "session_id": session_id,
            "user_id": 1,
            "event_type": "prompt",
            "source": "test",
            "content": "Test prompt",
        },
    )
    assert event_response.status_code == 200


def test_get_stats(client):
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_sessions" in data
    assert "total_minutes" in data


def test_analytics_export(client):
    response = client.get("/api/analytics/export")
    assert response.status_code == 200


def test_ml_patterns(client):
    response = client.get("/api/ml/patterns")
    assert response.status_code == 200
    data = response.json()
    assert "patterns" in data


def test_version_endpoint(client):
    response = client.get("/api/version")
    assert response.status_code == 200


def test_system_time(client):
    response = client.get("/api/time")
    assert response.status_code == 200


def test_invalid_session_id(client):
    response = client.post("/api/session/end/99999")
    assert response.status_code == 404
