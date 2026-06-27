from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["status"] == "UP"


def test_detection_person_detected_returns_none() -> None:
    response = client.post("/detect", json={"personDetected": True, "confidence": 98.5})
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["action"] == "NONE"


def test_detection_person_missing_returns_lock() -> None:
    response = client.post("/detect", json={"personDetected": False, "confidence": 82.1})
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["action"] == "LOCK"


def test_register_and_login_local_fallback() -> None:
    payload = {"email": "demo@example.com", "password": "secret123", "display_name": "Demo User"}
    register_response = client.post("/register", json=payload)
    assert register_response.status_code == 200
    assert register_response.json()["success"] is True

    login_response = client.post("/login", json={"email": "demo@example.com", "password": "secret123"})
    assert login_response.status_code == 200
    body = login_response.json()
    assert body["success"] is True
    assert body["data"]["user"]["email"] == "demo@example.com"


def test_login_prefers_email_password_over_invalid_id_token() -> None:
    payload = {"email": "priority@example.com", "password": "secret123", "display_name": "Priority User"}
    register_response = client.post("/register", json=payload)
    assert register_response.status_code == 200

    login_response = client.post(
        "/login",
        json={"email": "priority@example.com", "password": "secret123", "id_token": "not-a-real-token"},
    )
    assert login_response.status_code == 200
    body = login_response.json()
    assert body["success"] is True
    assert body["data"]["tokenType"] == "local-dev"
