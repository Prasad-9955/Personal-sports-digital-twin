import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session as DbSession
from app.database import get_db
from app.models import Athlete, Session, PoseMetric, PerformanceMetric, TwinState, Insight, Recommendation
from app.dependencies import get_current_athlete
from app.services.baseline_service import baseline_service
from app.services.trend_service import trend_service
from app.services.anomaly_service import anomaly_service
from app.services.twin_service import twin_service
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/demo", tags=["Demo & Sample Data"])

@router.post("/seed", status_code=status.HTTP_201_CREATED)
def seed_demo_longitudinal_data(
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """
    Seeds a verified 5-session longitudinal progression clearly labeled as SIMULATED_DEMO_DATA.
    Demonstrates baseline establishment, trend detection, and evolving twin states.
    """
    # 5 progressive training sessions spanning 2 weeks
    now = datetime.now(timezone.utc)
    demo_schedule = [
        {
            "days_ago": 14,
            "trunk": 14.8,
            "si": 11.4,
            "lk": 142.0,
            "rk": 159.0,
            "cadence": 158.0,
            "quality": 86.0
        },
        {
            "days_ago": 11,
            "trunk": 13.9,
            "si": 10.1,
            "lk": 144.0,
            "rk": 158.5,
            "cadence": 160.0,
            "quality": 88.0
        },
        {
            "days_ago": 8,
            "trunk": 12.6,
            "si": 8.8,
            "lk": 146.0,
            "rk": 158.0,
            "cadence": 163.0,
            "quality": 91.0
        },
        {
            "days_ago": 5,
            "trunk": 11.2,
            "si": 7.4,
            "lk": 148.0,
            "rk": 157.0,
            "cadence": 166.0,
            "quality": 93.0
        },
        {
            "days_ago": 1,
            "trunk": 10.1,
            "si": 6.2,
            "lk": 150.0,
            "rk": 156.5,
            "cadence": 169.0,
            "quality": 95.0
        },
    ]

    created_sessions = []

    for item in demo_schedule:
        s_date = now - timedelta(days=item["days_ago"])
        session = Session(
            athlete_id=current_athlete.id,
            recorded_at=s_date,
            video_filename=f"simulated_demo_gait_day_{item['days_ago']}.mp4",
            video_path=f"/demo/simulated_day_{item['days_ago']}.mp4",
            duration_sec=12.5,
            fps=30.0,
            resolution="1920x1080",
            processing_status="COMPLETED",
            quality_score=item["quality"],
            is_demo_data=True,
            created_at=s_date,
            completed_at=s_date
        )
        db.add(session)
        db.flush()

        # Pose metrics
        pm_trunk = PoseMetric(
            session_id=session.id,
            metric_name="trunk_inclination_angle",
            metric_value=item["trunk"],
            unit="degrees",
            confidence=round(item["quality"] / 100.0, 2),
            frame_count=375,
            metadata_json={"simulated": True, "min": item["trunk"] - 1.2, "max": item["trunk"] + 1.1}
        )
        pm_si = PoseMetric(
            session_id=session.id,
            metric_name="bilateral_symmetry_index",
            metric_value=item["si"],
            unit="percent",
            confidence=round(item["quality"] / 100.0, 2),
            frame_count=375,
            metadata_json={"simulated": True}
        )
        pm_lk = PoseMetric(
            session_id=session.id,
            metric_name="knee_flexion_left",
            metric_value=item["lk"],
            unit="degrees",
            confidence=round(item["quality"] / 100.0, 2),
            frame_count=375,
            metadata_json={"simulated": True}
        )
        pm_rk = PoseMetric(
            session_id=session.id,
            metric_name="knee_flexion_right",
            metric_value=item["rk"],
            unit="degrees",
            confidence=round(item["quality"] / 100.0, 2),
            frame_count=375,
            metadata_json={"simulated": True}
        )
        pf_cad = PerformanceMetric(
            session_id=session.id,
            metric_name="step_cadence",
            metric_value=item["cadence"],
            unit="steps/min",
            measurement_method="simulated_peak_prominence",
            quality_score=item["quality"]
        )
        db.add_all([pm_trunk, pm_si, pm_lk, pm_rk, pf_cad])
        db.flush()

        # Update analytical state sequentially
        baseline_service.calculate_athlete_baselines(db, current_athlete.id)
        trend_service.calculate_athlete_trends(db, current_athlete.id)
        anomaly_service.detect_session_deviations(db, current_athlete.id, session.id)
        twin_state = twin_service.update_twin_state(db, current_athlete.id, session.id)

        # Grounded readback
        structured_facts = {
            "session_id": str(session.id),
            "data_quality_score": session.quality_score,
            "current_metrics": twin_state.current_metrics,
            "baseline_summary": twin_state.baseline_summary,
            "trend_summary": twin_state.trend_summary,
            "deviations": twin_state.deviation_summary,
            "total_sessions_tracked": twin_state.total_sessions_tracked,
            "is_demo_data": True
        }
        gemini_service.generate_explanation_and_recommendations(
            db, current_athlete.id, session.id, structured_facts
        )

        created_sessions.append(str(session.id))

    db.commit()

    return {
        "message": "Successfully seeded 5-session longitudinal demo dataset.",
        "labeled": "SIMULATED_DEMO_DATA",
        "total_sessions_created": len(created_sessions),
        "session_ids": created_sessions
    }
