import uuid
import pytest
from app.services.gemini_service import gemini_service

def test_gemini_fallback_generation():
    facts = {
        "data_quality_score": 92.0,
        "total_sessions_tracked": 5,
        "current_metrics": {
            "trunk_inclination_angle": {"value": 11.5},
            "bilateral_symmetry_index": {"value": 6.8},
            "step_cadence": {"value": 172.0}
        },
        "baseline_summary": {
            "trunk_inclination_angle": {"median": 13.0},
            "bilateral_symmetry_index": {"median": 9.5},
            "step_cadence": {"median": 165.0}
        },
        "trend_summary": {
            "trunk_inclination_angle": {"label": "IMPROVING"},
            "bilateral_symmetry_index": {"label": "IMPROVING"}
        },
        "deviations": {}
    }

    explanation, recommendation = gemini_service._generate_fallback(facts)
    assert len(explanation) > 50
    assert "11.5°" in explanation
    assert "6.8%" in explanation
    assert len(recommendation) > 20

def test_demo_seed_endpoint(client):
    unique_email = f"demo_runner_{uuid.uuid4().hex[:8]}@example.com"
    reg_resp = client.post("/api/v1/auth/register", json={
        "email": unique_email,
        "password": "Password123!",
        "display_name": "Demo Athlete",
        "sport": "running"
    })
    assert reg_resp.status_code == 201
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Seed demo data
    seed_resp = client.post("/api/v1/demo/seed", headers=headers)
    assert seed_resp.status_code == 201
    seed_data = seed_resp.json()
    assert seed_data["total_sessions_created"] == 5
    assert seed_data["labeled"] == "SIMULATED_DEMO_DATA"

    # Query Digital Twin Overview
    twin_resp = client.get("/api/v1/twin", headers=headers)
    assert twin_resp.status_code == 200
    twin_data = twin_resp.json()
    assert twin_data["has_baseline"] is True
    assert twin_data["total_sessions"] == 5
    assert twin_data["active_state"]["state_version"] >= 5

    # Query Trends
    trend_resp = client.get("/api/v1/trends", headers=headers)
    assert trend_resp.status_code == 200
    assert len(trend_resp.json()) > 0

    # Query Metric History for Charts
    chart_resp = client.get("/api/v1/metrics/history/bilateral_symmetry_index", headers=headers)
    assert chart_resp.status_code == 200
    history = chart_resp.json()
    assert len(history["points"]) == 5
    assert history["points"][0]["baseline_value"] is not None
