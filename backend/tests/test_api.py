import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_create_session():
    response = client.post("/api/session/start", json={"user_id": 1, "source": "test"})
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["user_id"] == 1
    assert data["is_active"] == True


def test_end_session():
    start_response = client.post(
        "/api/session/start", json={"user_id": 1, "source": "test"}
    )
    session_id = start_response.json()["id"]

    end_response = client.post(f"/api/session/end/{session_id}")
    assert end_response.status_code == 200
    data = end_response.json()
    assert data["is_active"] == False
    assert data["end_time"] is not None


def test_log_event():
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
    data = event_response.json()
    assert data["event_type"] == "prompt"
    assert data["content"] == "Test prompt"


def test_get_stats():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_sessions" in data
    assert "total_minutes" in data


def test_vibe_score_calculation():
    session_response = client.post(
        "/api/session/start", json={"user_id": 1, "source": "test"}
    )
    session_id = session_response.json()["id"]

    client.post(
        "/api/event",
        json={
            "session_id": session_id,
            "user_id": 1,
            "event_type": "prompt",
            "source": "test",
            "content": "Test",
        },
    )

    client.post(f"/api/session/end/{session_id}")

    calc_response = client.post(f"/api/session/calculate-vibe/{session_id}")
    assert calc_response.status_code == 200
    data = calc_response.json()
    assert "vibe_score" in data
    assert "classification" in data


def test_analytics_export():
    response = client.get("/api/analytics/export")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"


def test_ml_patterns():
    response = client.get("/api/ml/patterns")
    assert response.status_code == 200
    data = response.json()
    assert "patterns" in data


def test_invalid_session_id():
    response = client.post("/api/session/end/99999")
    assert response.status_code == 404
