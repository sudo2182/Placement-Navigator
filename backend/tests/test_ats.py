import time
from fastapi.testclient import TestClient
from backend.main_minimal import app

client = TestClient(app)


def test_health_endpoint():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "environment" in data


def _register_or_login_student(email: str, password: str):
    # Try register
    reg_resp = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "role": "student",
            "profile_data": {}
        },
    )
    if reg_resp.status_code == 200:
        data = reg_resp.json()
        return data["access_token"], data["user"]
    else:
        # Fallback to login
        login_resp = client.post(
            "/auth/login",
            json={"email": email, "password": password},
        )
        assert login_resp.status_code == 200
        data = login_resp.json()
        return data["access_token"], data["user"]


def test_ats_scan_requires_auth():
    # Without token should be 401
    resp = client.post(
        "/ats/scan",
        json={
            "resume_text": "Software engineer skilled in Python and React.",
            "job_description": "Looking for engineer with Python, React."
        },
    )
    assert resp.status_code in (401, 403)


def test_ats_scan_authorized():
    # Unique email to avoid conflicts across runs
    email = f"student+{int(time.time())}@example.com"
    password = "password123"

    token, user = _register_or_login_student(email, password)
    assert user["role"] == "student"

    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post(
        "/ats/scan",
        headers=headers,
        json={
            "resume_text": "Experienced engineer with Python, React, AWS, Docker. Education: BTech.",
            "job_description": "We seek an engineer proficient in Python, React, AWS, Docker, SQL.",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "overall_score" in data
    assert "breakdown" in data
    assert isinstance(data["matched_keywords"], list)
    assert isinstance(data["missing_required"], list)
    assert isinstance(data["suggestions"], list)