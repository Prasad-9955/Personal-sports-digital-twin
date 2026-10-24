import uuid
import pytest
from datetime import datetime, timezone, timedelta
from app.models import User, Athlete, Session, PoseMetric, PerformanceMetric, TwinState, PersonalBaseline, TrendResult, AnomalyResult
from app.services.baseline_service import baseline_service
from app.services.trend_service import trend_service
from app.services.anomaly_service import anomaly_service
from app.services.twin_service import twin_service

def test_baseline_and_twin_evolution(db):
    # 1. Create Athlete
    user = User(email=f"athlete_{uuid.uuid4().hex[:6]}@example.com", password_hash="dummy")
    db.add(user)
    db.flush()

    athlete = Athlete(user_id=user.id, display_name="Test Athlete", sport="running")
    db.add(athlete)
    db.flush()

    # With 0 or 2 sessions, baseline should NOT be established (requires >= 3)
    b_early = baseline_service.calculate_athlete_baselines(db, athlete.id)
    assert len(b_early) == 0

    # Add 3 sessions
    now = datetime.now(timezone.utc)
    for i in range(3):
        sess = Session(
            athlete_id=athlete.id,
            recorded_at=now - timedelta(days=3 - i),
            video_filename=f"vid_{i}.mp4",
            video_path=f"/tmp/vid_{i}.mp4",
            processing_status="COMPLETED",
            quality_score=90.0
        )
        db.add(sess)
        db.flush()

        pm = PoseMetric(
            session_id=sess.id,
            metric_name="bilateral_symmetry_index",
            metric_value=10.0 - i,  # 10.0, 9.0, 8.0
            unit="percent",
            confidence=0.9,
            frame_count=100
        )
        db.add(pm)
        db.flush()

    # Now calculate baseline with N=3 sessions
    baselines = baseline_service.calculate_athlete_baselines(db, athlete.id)
    assert len(baselines) > 0
    b_si = next(b for b in baselines if b.metric_name == "bilateral_symmetry_index")
    assert b_si.sample_count == 3
    assert b_si.baseline_median == 9.0
    assert b_si.confidence_level == "LOW"

    # Calculate trends
    trends = trend_service.calculate_athlete_trends(db, athlete.id)
    assert len(trends) > 0
    t_si = next(t for t in trends if t.metric_name == "bilateral_symmetry_index")
    # Decreasing symmetry index is IMPROVING
    assert t_si.slope < 0
    assert t_si.trend_label == "IMPROVING"

    # Create Twin State Version 1
    last_sess = db.query(Session).filter(Session.athlete_id == athlete.id).order_by(Session.recorded_at.desc()).first()
    twin_v1 = twin_service.update_twin_state(db, athlete.id, last_sess.id)
    assert twin_v1.state_version == 1
    assert twin_v1.total_sessions_tracked == 3
    assert "bilateral_symmetry_index" in twin_v1.current_metrics

    # Add a 4th session with an elevated deviation (SI = 25.0%)
    sess_4 = Session(
        athlete_id=athlete.id,
        recorded_at=now,
        video_filename="vid_4.mp4",
        video_path="/tmp/vid_4.mp4",
        processing_status="COMPLETED",
        quality_score=92.0
    )
    db.add(sess_4)
    db.flush()

    pm_4 = PoseMetric(
        session_id=sess_4.id,
        metric_name="bilateral_symmetry_index",
        metric_value=25.0,  # Sudden spike
        unit="percent",
        confidence=0.92,
        frame_count=100
    )
    db.add(pm_4)
    db.flush()

    # Anomaly detection
    anomalies = anomaly_service.detect_session_deviations(db, athlete.id, sess_4.id)
    assert len(anomalies) > 0
    anom = anomalies[0]
    assert anom.severity in ["MILD", "ELEVATED"]
    assert "personal baseline median" in anom.explanation

    # Twin State Version 2
    twin_v2 = twin_service.update_twin_state(db, athlete.id, sess_4.id)
    assert twin_v2.state_version == 2
    assert twin_v2.total_sessions_tracked == 4
    assert twin_v2.status_summary in ["NEEDS_MONITORING", "MILD_VARIATION"]
