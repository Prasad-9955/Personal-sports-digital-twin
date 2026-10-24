import uuid
import pytest
from app.dependencies import hash_password, verify_password

def test_password_hashing():
    pwd = "AthleticPassword2026!"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_register_and_login_flow(client):
    unique_email = f"runner_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "email": unique_email,
        "password": "SecretPassword123!",
        "display_name": "Jordan Runner",
        "sport": "running",
        "experience_level": "advanced",
        "height_cm": 178.0,
        "weight_kg": 70.5
    }

    # 1. Register
    reg_resp = client.post("/api/v1/auth/register", json=payload)
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == unique_email
    assert data["display_name"] == "Jordan Runner"
    token = data["access_token"]

    # 2. Duplicate registration rejected
    dup_resp = client.post("/api/v1/auth/register", json=payload)
    assert dup_resp.status_code == 400

    # 3. Login
    login_resp = client.post("/api/v1/auth/login", json={
        "email": unique_email,
        "password": "SecretPassword123!"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # 4. Access protected profile
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/athletes/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["display_name"] == "Jordan Runner"
    assert me_resp.json()["sport"] == "running"

def test_unauthorized_access(client):
    resp = client.get("/api/v1/athletes/me")
    assert resp.status_code == 401
