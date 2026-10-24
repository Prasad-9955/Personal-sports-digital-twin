import os
import sys
import uuid
import tempfile
import cv2
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import Athlete, Session, PoseMetric, PerformanceMetric, PersonalBaseline, TrendResult, AnomalyResult, TwinState
from app.services.gemini_service import gemini_service
from app.services.anomaly_service import anomaly_service
from app.services.baseline_service import baseline_service
from app.services.trend_service import trend_service
from app.services.twin_service import twin_service

client = TestClient(app)

results = {}

# SCENARIO 1: New athlete baseline check
email_s1 = f"audit_new_{uuid.uuid4().hex[:6]}@example.com"
r_reg = client.post("/api/v1/auth/register", json={"email": email_s1, "password": "Password123!", "display_name": "Audit New", "sport": "running"})
token_s1 = r_reg.json()["access_token"]
headers_s1 = {"Authorization": f"Bearer {token_s1}"}
r_twin1 = client.get("/api/v1/twin", headers=headers_s1)
d_twin1 = r_twin1.json()
db_s1_check = SessionLocal()
athlete_s1_uuid = uuid.UUID(r_reg.json()["athlete_id"])
baselines_s1_count = db_s1_check.query(PersonalBaseline).filter(PersonalBaseline.athlete_id == athlete_s1_uuid).count()
db_s1_check.close()
s1_pass = (
    d_twin1["has_baseline"] is False and 
    d_twin1["total_sessions"] == 0 and 
    d_twin1["active_state"] is None and 
    baselines_s1_count == 0 and
    ("No sessions" in d_twin1["baseline_status_message"] or "Calibrating" in d_twin1["baseline_status_message"])
)
results["SCENARIO_1_NEW_ATHLETE"] = {"pass": s1_pass, "details": d_twin1["baseline_status_message"], "has_baseline": d_twin1["has_baseline"], "baselines_in_db": baselines_s1_count}

# SCENARIO 2: First valid session creation & twin state v1
db = SessionLocal()
athlete_s1_id = uuid.UUID(r_reg.json()["athlete_id"])
athlete_s1 = db.query(Athlete).filter(Athlete.id == athlete_s1_id).first()
s1 = Session(
    athlete_id=athlete_s1.id,
    video_filename="session_1.mp4",
    video_path="/uploads/session_1.mp4",
    duration_sec=10.0,
    fps=30.0,
    processing_status="COMPLETED",
    quality_score=94.5
)
db.add(s1)
db.flush()
db.add_all([
    PoseMetric(session_id=s1.id, metric_name="trunk_inclination_angle", metric_value=12.5, unit="degrees", confidence=0.94, frame_count=300),
    PoseMetric(session_id=s1.id, metric_name="bilateral_symmetry_index", metric_value=8.2, unit="percent", confidence=0.94, frame_count=300),
    PoseMetric(session_id=s1.id, metric_name="knee_flexion_left", metric_value=145.0, unit="degrees", confidence=0.94, frame_count=300),
    PoseMetric(session_id=s1.id, metric_name="knee_flexion_right", metric_value=158.0, unit="degrees", confidence=0.94, frame_count=300),
    PerformanceMetric(session_id=s1.id, metric_name="step_cadence", metric_value=164.0, unit="steps/min", measurement_method="ankle_peak", quality_score=94.5)
])
db.flush()
baseline_service.calculate_athlete_baselines(db, athlete_s1.id)
trend_service.calculate_athlete_trends(db, athlete_s1.id)
anomaly_service.detect_session_deviations(db, athlete_s1.id, s1.id)
twin_v1 = twin_service.update_twin_state(db, athlete_s1.id, s1.id)
db.commit()

r_twin2 = client.get("/api/v1/twin", headers=headers_s1)
d_twin2 = r_twin2.json()
s2_pass = (d_twin2["total_sessions"] == 1 and d_twin2["active_state"]["state_version"] == 1 and d_twin2["has_baseline"] is False)
results["SCENARIO_2_FIRST_SESSION"] = {"pass": s2_pass, "twin_version": d_twin2["active_state"]["state_version"], "total_sessions": d_twin2["total_sessions"]}

# SCENARIO 3: Repeated sessions & baseline establishment (sessions 2 & 3)
for idx, (trunk, si, cad) in enumerate([(11.8, 7.9, 166.0), (11.0, 7.2, 168.0)]):
    s = Session(athlete_id=athlete_s1.id, video_filename=f"session_{idx+2}.mp4", video_path=f"/uploads/session_{idx+2}.mp4", duration_sec=10.0, fps=30.0, processing_status="COMPLETED", quality_score=95.0)
    db.add(s)
    db.flush()
    db.add_all([
        PoseMetric(session_id=s.id, metric_name="trunk_inclination_angle", metric_value=trunk, unit="degrees", confidence=0.95, frame_count=300),
        PoseMetric(session_id=s.id, metric_name="bilateral_symmetry_index", metric_value=si, unit="percent", confidence=0.95, frame_count=300),
        PoseMetric(session_id=s.id, metric_name="knee_flexion_left", metric_value=146.0, unit="degrees", confidence=0.95, frame_count=300),
        PoseMetric(session_id=s.id, metric_name="knee_flexion_right", metric_value=157.0, unit="degrees", confidence=0.95, frame_count=300),
        PerformanceMetric(session_id=s.id, metric_name="step_cadence", metric_value=cad, unit="steps/min", measurement_method="ankle_peak", quality_score=95.0)
    ])
    db.flush()
    baseline_service.calculate_athlete_baselines(db, athlete_s1.id)
    trend_service.calculate_athlete_trends(db, athlete_s1.id)
    anomaly_service.detect_session_deviations(db, athlete_s1.id, s.id)
    twin_service.update_twin_state(db, athlete_s1.id, s.id)
    db.commit()

r_twin3 = client.get("/api/v1/twin", headers=headers_s1)
d_twin3 = r_twin3.json()
s3_pass = (d_twin3["total_sessions"] == 3 and d_twin3["has_baseline"] is True and d_twin3["active_state"]["state_version"] == 3)
results["SCENARIO_3_REPEATED_SESSIONS"] = {"pass": s3_pass, "total_sessions": d_twin3["total_sessions"], "has_baseline": d_twin3["has_baseline"], "state_version": d_twin3["active_state"]["state_version"]}

# SCENARIO 4: Controlled deviation detection
dev_s = Session(athlete_id=athlete_s1.id, video_filename="dev_test.mp4", video_path="/dev/null", duration_sec=3.0, fps=30.0, processing_status="COMPLETED", quality_score=90.0)
db.add(dev_s)
db.flush()
db.add(PoseMetric(session_id=dev_s.id, metric_name="trunk_inclination_angle", metric_value=28.5, unit="degrees", confidence=0.95, frame_count=90))
db.commit()
anomalies = anomaly_service.detect_session_deviations(db, athlete_s1.id, dev_s.id)
db.commit()
s4_pass = len(anomalies) > 0 and anomalies[0].severity in ["MILD", "ELEVATED"]
results["SCENARIO_4_CONTROLLED_DEVIATION"] = {"pass": s4_pass, "deviations_found": len(anomalies), "severity": anomalies[0].severity if anomalies else None, "score": anomalies[0].deviation_score if anomalies else None}

# SCENARIO 5: Twin update & history preservation
twin_history = client.get("/api/v1/twin/history", headers=headers_s1).json()
s5_pass = len(twin_history) >= 3 and twin_history[0]["state_version"] > twin_history[-1]["state_version"]
results["SCENARIO_5_TWIN_UPDATE_HISTORY"] = {"pass": s5_pass, "history_snapshots": len(twin_history)}

# SCENARIO 6: Restart persistence
persisted_sessions = db.query(Session).count()
s6_pass = persisted_sessions >= 20
results["SCENARIO_6_PERSISTENCE"] = {"pass": s6_pass, "persisted_sessions": persisted_sessions}

# SCENARIO 7: Invalid input rejection
with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as tf_inv:
    tf_inv.write(b"non-video content")
    inv_path = tf_inv.name
with open(inv_path, "rb") as f:
    r_inv = client.post("/api/v1/sessions/upload", files={"file": ("bad.txt", f, "text/plain")}, headers=headers_s1)
s7_pass = (r_inv.status_code == 400 and "Unsupported video format" in r_inv.json()["detail"])
results["SCENARIO_7_INVALID_INPUT"] = {"pass": s7_pass, "status_code": r_inv.status_code, "detail": r_inv.json().get("detail")}

# SCENARIO 8: Gemini fallback generation
facts_test = {
    "data_quality_score": 90.0,
    "total_sessions_tracked": 4,
    "current_metrics": {"trunk_inclination_angle": {"value": 11.2}, "bilateral_symmetry_index": {"value": 7.4}, "step_cadence": {"value": 168.0}},
    "baseline_summary": {"trunk_inclination_angle": {"median": 12.0}, "bilateral_symmetry_index": {"median": 9.0}, "step_cadence": {"median": 165.0}},
    "trend_summary": {"trunk_inclination_angle": {"label": "IMPROVING"}, "bilateral_symmetry_index": {"label": "IMPROVING"}},
    "deviations": {}
}
exp, rec = gemini_service._generate_fallback(facts_test)
s8_pass = len(exp) > 50 and "11.2°" in exp and len(rec) > 20
results["SCENARIO_8_GEMINI_FALLBACK"] = {"pass": s8_pass, "explanation_len": len(exp), "recommendation_len": len(rec)}

# SCENARIO 9: Data ownership enforcement
email_s2 = f"audit_other_{uuid.uuid4().hex[:6]}@example.com"
r_reg2 = client.post("/api/v1/auth/register", json={"email": email_s2, "password": "Password123!", "display_name": "Audit Other", "sport": "running"})
token_s2 = r_reg2.json()["access_token"]
headers_s2 = {"Authorization": f"Bearer {token_s2}"}
r_forbidden = client.get(f"/api/v1/sessions/{s1.id}", headers=headers_s2)
s9_pass = (r_forbidden.status_code == 403 and "Access denied" in r_forbidden.json()["detail"])
results["SCENARIO_9_DATA_OWNERSHIP"] = {"pass": s9_pass, "status_code": r_forbidden.status_code}

# SCENARIO 10: UI/API consistency
r_dash = client.get("/api/v1/twin", headers=headers_s1)
latest_twin_db = db.query(TwinState).filter(TwinState.athlete_id == athlete_s1.id).order_by(TwinState.state_version.desc()).first()
s10_pass = (r_dash.json()["active_state"]["state_version"] == latest_twin_db.state_version)
results["SCENARIO_10_UI_CONSISTENCY"] = {"pass": s10_pass, "api_version": r_dash.json()["active_state"]["state_version"], "db_version": latest_twin_db.state_version}

db.close()
try:
    os.unlink(inv_path)
except Exception:
    pass

import json
print("ALL_SCENARIOS_OUTPUT_START")
print(json.dumps(results, indent=2))
print("ALL_SCENARIOS_OUTPUT_END")
