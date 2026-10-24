import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import numpy as np
from sqlalchemy.orm import Session as DbSession
from app.models import Athlete, Session, PoseMetric, PerformanceMetric, PersonalBaseline

class BaselineService:
    WINDOW_SIZE = 10  # Rolling window of the most recent completed valid sessions

    def calculate_athlete_baselines(self, db: DbSession, athlete_id: uuid.UUID) -> List[PersonalBaseline]:
        """
        Calculates and persists athlete personal baselines using historical completed sessions.
        """
        # Fetch the most recent completed sessions for this athlete
        recent_sessions = (
            db.query(Session)
            .filter(
                Session.athlete_id == athlete_id,
                Session.processing_status == "COMPLETED"
            )
            .order_by(Session.recorded_at.desc())
            .limit(self.WINDOW_SIZE)
            .all()
        )

        session_count = len(recent_sessions)
        session_ids = [s.id for s in recent_sessions]

        if session_count < 3:
            # Insufficient sessions to calculate a reliable baseline
            return []

        # Determine confidence level based on historical sample count
        if session_count < 5:
            confidence = "LOW"
        elif session_count < 10:
            confidence = "MODERATE"
        else:
            confidence = "HIGH"

        # Group metrics across these sessions
        metrics_by_name: Dict[str, List[float]] = {}

        # 1. Pose metrics
        pose_rows = db.query(PoseMetric).filter(PoseMetric.session_id.in_(session_ids)).all()
        for p in pose_rows:
            metrics_by_name.setdefault(p.metric_name, []).append(p.metric_value)

        # 2. Performance metrics
        perf_rows = db.query(PerformanceMetric).filter(PerformanceMetric.session_id.in_(session_ids)).all()
        for pf in perf_rows:
            metrics_by_name.setdefault(pf.metric_name, []).append(pf.metric_value)

        updated_baselines: List[PersonalBaseline] = []

        for metric_name, values in metrics_by_name.items():
            if len(values) < 3:
                continue

            arr = np.array(values)
            median_val = float(np.median(arr))
            mean_val = float(np.mean(arr))
            std_val = float(np.std(arr))
            q75, q25 = np.percentile(arr, [75, 25])
            iqr_val = float(q75 - q25)

            # Look up existing baseline
            existing = (
                db.query(PersonalBaseline)
                .filter(
                    PersonalBaseline.athlete_id == athlete_id,
                    PersonalBaseline.metric_name == metric_name
                )
                .first()
            )

            if existing:
                existing.baseline_value = round(median_val, 2)
                existing.baseline_mean = round(mean_val, 2)
                existing.baseline_median = round(median_val, 2)
                existing.dispersion_std = round(std_val, 2)
                existing.dispersion_iqr = round(iqr_val, 2)
                existing.sample_count = len(values)
                existing.confidence_level = confidence
                existing.calculated_at = datetime.now(timezone.utc)
                updated_baselines.append(existing)
            else:
                new_baseline = PersonalBaseline(
                    athlete_id=athlete_id,
                    metric_name=metric_name,
                    baseline_value=round(median_val, 2),
                    baseline_mean=round(mean_val, 2),
                    baseline_median=round(median_val, 2),
                    dispersion_std=round(std_val, 2),
                    dispersion_iqr=round(iqr_val, 2),
                    method="robust_median_iqr",
                    window_size=self.WINDOW_SIZE,
                    sample_count=len(values),
                    confidence_level=confidence,
                    calculated_at=datetime.now(timezone.utc)
                )
                db.add(new_baseline)
                updated_baselines.append(new_baseline)

        db.flush()
        return updated_baselines

baseline_service = BaselineService()
