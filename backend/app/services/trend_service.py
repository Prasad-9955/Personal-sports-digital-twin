import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import numpy as np
from scipy.stats import linregress
from sqlalchemy.orm import Session as DbSession
from app.models import Session, PoseMetric, PerformanceMetric, TrendResult

class TrendService:
    def calculate_athlete_trends(self, db: DbSession, athlete_id: uuid.UUID) -> List[TrendResult]:
        """
        Analyzes chronological trends for all tracked metrics and classifies trend direction.
        """
        # Fetch completed sessions in chronological order
        sessions = (
            db.query(Session)
            .filter(
                Session.athlete_id == athlete_id,
                Session.processing_status == "COMPLETED"
            )
            .order_by(Session.recorded_at.asc())
            .all()
        )

        if len(sessions) < 3:
            return []

        session_map = {s.id: idx for idx, s in enumerate(sessions)}
        session_ids = [s.id for s in sessions]

        # Collect metrics by name: list of (session_index, value)
        series_by_metric: Dict[str, List[float]] = {}

        pose_records = db.query(PoseMetric).filter(PoseMetric.session_id.in_(session_ids)).all()
        for p in pose_records:
            series_by_metric.setdefault(p.metric_name, []).append(p.metric_value)

        perf_records = db.query(PerformanceMetric).filter(PerformanceMetric.session_id.in_(session_ids)).all()
        for pf in perf_records:
            series_by_metric.setdefault(pf.metric_name, []).append(pf.metric_value)

        updated_trends: List[TrendResult] = []

        for metric_name, values in series_by_metric.items():
            if len(values) < 3:
                continue

            x = np.arange(len(values))
            y = np.array(values)

            # Linear regression
            reg = linregress(x, y)
            slope = float(reg.slope)
            r_val = float(reg.rvalue) if reg.rvalue is not None else 0.0
            r_squared = float(r_val ** 2)
            p_val = float(reg.pvalue) if reg.pvalue is not None else 1.0

            # Classify trend direction according to metric biomechanical polarity
            std_y = float(np.std(y))
            meaningful_threshold = max(0.2, 0.1 * std_y)

            if abs(slope) < meaningful_threshold or p_val > 0.20:
                trend_label = "STABLE"
            elif metric_name == "bilateral_symmetry_index":
                # Lower SI is better
                trend_label = "IMPROVING" if slope < 0 else "DECLINING"
            elif metric_name == "step_cadence":
                # For runners striving for 170-180, moderate upward trend is typically improving
                mean_cadence = float(np.mean(y))
                if mean_cadence < 170:
                    trend_label = "IMPROVING" if slope > 0 else "DECLINING"
                else:
                    trend_label = "STABLE"
            elif metric_name == "trunk_inclination_angle":
                # Excessive lean (>12 deg) is inefficient; reducing lean towards 8 deg is improving
                mean_trunk = float(np.mean(y))
                if mean_trunk > 10.0:
                    trend_label = "IMPROVING" if slope < 0 else "DECLINING"
                else:
                    trend_label = "STABLE"
            else:
                # Knee flexion: stability is optimal
                trend_label = "STABLE" if abs(slope) < 1.0 else ("IMPROVING" if slope > 0 else "DECLINING")

            existing = (
                db.query(TrendResult)
                .filter(
                    TrendResult.athlete_id == athlete_id,
                    TrendResult.metric_name == metric_name
                )
                .first()
            )

            metadata = {
                "r_squared": round(r_squared, 3),
                "p_value": round(p_val, 4),
                "std": round(std_y, 2),
                "last_value": round(float(values[-1]), 2)
            }

            if existing:
                existing.trend_label = trend_label
                existing.slope = round(slope, 3)
                existing.r_squared = round(r_squared, 3)
                existing.observation_count = len(values)
                existing.confidence_metadata = metadata
                existing.calculated_at = datetime.now(timezone.utc)
                updated_trends.append(existing)
            else:
                new_trend = TrendResult(
                    athlete_id=athlete_id,
                    metric_name=metric_name,
                    trend_label=trend_label,
                    slope=round(slope, 3),
                    r_squared=round(r_squared, 3),
                    observation_count=len(values),
                    confidence_metadata=metadata,
                    calculated_at=datetime.now(timezone.utc)
                )
                db.add(new_trend)
                updated_trends.append(new_trend)

        db.flush()
        return updated_trends

trend_service = TrendService()
