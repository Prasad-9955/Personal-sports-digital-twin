import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import numpy as np
from sqlalchemy.orm import Session as DbSession
from app.models import Athlete, Session, PoseMetric, PerformanceMetric, PersonalBaseline, TrendResult, AnomalyResult, TwinState

class TwinService:
    def update_twin_state(
        self,
        db: DbSession,
        athlete_id: uuid.UUID,
        session_id: uuid.UUID
    ) -> TwinState:
        """
        Deterministically updates the athlete's Digital Twin after a newly validated session.
        Increments state version, captures full historical snapshot, and stores in PostgreSQL.
        """
        # Fetch current latest version for this athlete
        last_state = (
            db.query(TwinState)
            .filter(TwinState.athlete_id == athlete_id)
            .order_by(TwinState.state_version.desc())
            .first()
        )
        next_version = (last_state.state_version + 1) if last_state else 1

        # Fetch current session metrics
        session = db.query(Session).filter(Session.id == session_id).first()
        if not session:
            raise ValueError(f"Session {session_id} not found")

        current_metrics: Dict[str, Any] = {}
        for pm in session.pose_metrics:
            current_metrics[pm.metric_name] = {
                "value": pm.metric_value,
                "unit": pm.unit,
                "confidence": pm.confidence,
                "metadata": pm.metadata_json
            }
        for pfm in session.performance_metrics:
            current_metrics[pfm.metric_name] = {
                "value": pfm.metric_value,
                "unit": pfm.unit,
                "method": pfm.measurement_method,
                "quality": pfm.quality_score
            }

        # Fetch latest athlete baselines
        baselines = db.query(PersonalBaseline).filter(PersonalBaseline.athlete_id == athlete_id).all()
        baseline_summary: Dict[str, Any] = {
            b.metric_name: {
                "baseline_value": b.baseline_value,
                "mean": b.baseline_mean,
                "median": b.baseline_median,
                "std": b.dispersion_std,
                "iqr": b.dispersion_iqr,
                "samples": b.sample_count,
                "confidence": b.confidence_level
            }
            for b in baselines
        }

        # Fetch latest athlete trends
        trends = db.query(TrendResult).filter(TrendResult.athlete_id == athlete_id).all()
        trend_summary: Dict[str, Any] = {
            t.metric_name: {
                "label": t.trend_label,
                "slope": t.slope,
                "r_squared": t.r_squared,
                "count": t.observation_count
            }
            for t in trends
        }

        # Fetch recent session anomalies
        anomalies = (
            db.query(AnomalyResult)
            .filter(AnomalyResult.session_id == session_id)
            .all()
        )
        deviation_summary: Dict[str, Any] = {
            a.metric_name: {
                "observed": a.observed_value,
                "expected": a.expected_value,
                "score": a.deviation_score,
                "severity": a.severity,
                "explanation": a.explanation
            }
            for a in anomalies
        }

        # Calculate Longitudinal Tracking Quality Index
        # Combines current session quality with historical baseline confidence
        session_quality = session.quality_score or 80.0
        baseline_conf_multiplier = 0.6 if len(baselines) == 0 else (0.8 if len(baselines) < 3 else 1.0)
        data_quality_index = round(float(session_quality * baseline_conf_multiplier), 1)

        total_sessions = (
            db.query(Session)
            .filter(Session.athlete_id == athlete_id, Session.processing_status == "COMPLETED")
            .count()
        )

        status_summary = "ACTIVE"
        if len(deviation_summary) > 0:
            if any(a["severity"] == "ELEVATED" for a in deviation_summary.values()):
                status_summary = "NEEDS_MONITORING"
            else:
                status_summary = "MILD_VARIATION"

        # Create new immutable state snapshot
        new_twin_state = TwinState(
            athlete_id=athlete_id,
            state_version=next_version,
            current_metrics=current_metrics,
            baseline_summary=baseline_summary,
            trend_summary=trend_summary,
            deviation_summary=deviation_summary,
            data_quality_index=data_quality_index,
            total_sessions_tracked=total_sessions,
            status_summary=status_summary,
            created_at=datetime.now(timezone.utc)
        )
        db.add(new_twin_state)
        db.flush()
        return new_twin_state

    def get_latest_twin_state(self, db: DbSession, athlete_id: uuid.UUID) -> Optional[TwinState]:
        """Returns the active latest version of the Digital Twin."""
        return (
            db.query(TwinState)
            .filter(TwinState.athlete_id == athlete_id)
            .order_by(TwinState.state_version.desc())
            .first()
        )

twin_service = TwinService()
