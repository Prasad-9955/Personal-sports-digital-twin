import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import numpy as np
from sklearn.ensemble import IsolationForest
from sqlalchemy.orm import Session as DbSession
from app.models import Athlete, Session, PoseMetric, PerformanceMetric, PersonalBaseline, AnomalyResult

class AnomalyService:
    def detect_session_deviations(
        self,
        db: DbSession,
        athlete_id: uuid.UUID,
        session_id: uuid.UUID
    ) -> List[AnomalyResult]:
        """
        Detects deviations for the target session relative to the athlete's personal baseline history.
        Uses Modified Z-score (median/MAD) for N < 10, and Isolation Forest when N >= 10.
        """
        # Fetch current session metrics
        current_pose = db.query(PoseMetric).filter(PoseMetric.session_id == session_id).all()
        current_perf = db.query(PerformanceMetric).filter(PerformanceMetric.session_id == session_id).all()

        current_metrics: Dict[str, float] = {p.metric_name: p.metric_value for p in current_pose}
        current_metrics.update({pf.metric_name: pf.metric_value for pf in current_perf})

        # Fetch athlete baselines
        baselines = db.query(PersonalBaseline).filter(PersonalBaseline.athlete_id == athlete_id).all()
        baseline_map = {b.metric_name: b for b in baselines}

        detected_anomalies: List[AnomalyResult] = []

        # Check total historical completed sessions
        total_sessions = (
            db.query(Session)
            .filter(Session.athlete_id == athlete_id, Session.processing_status == "COMPLETED")
            .count()
        )

        use_ml_isolation_forest = (total_sessions >= 10)

        for metric_name, observed_val in current_metrics.items():
            b = baseline_map.get(metric_name)
            if not b or b.sample_count < 3:
                # No baseline established yet for this metric
                continue

            median = b.baseline_median
            iqr = b.dispersion_iqr
            std = b.dispersion_std

            # Calculate Modified Z-score
            # M_i = 0.6745 * (x - median) / MAD
            # Approximate MAD as IQR / 1.349 if normal distribution
            mad = (iqr / 1.349) if iqr > 0.001 else (std * 0.7979 if std > 0.001 else 1.0)
            diff = observed_val - median
            mod_z = abs(0.6745 * diff / mad) if mad > 0 else 0.0

            # Severity classification
            if mod_z < 1.75:
                continue  # Within normal personal variability

            if mod_z >= 2.5:
                severity = "ELEVATED"
            else:
                severity = "MILD"

            # Construct clear, non-alarmist scientific explanation
            direction = "above" if diff > 0 else "below"
            unit = "degrees" if "angle" in metric_name or "flexion" in metric_name else ("%" if "symmetry" in metric_name else "units")
            explanation = (
                f"Statistical deviation: Observed {metric_name.replace('_', ' ')} of {observed_val:.1f} {unit} is "
                f"{abs(diff):.1f} {unit} {direction} your personal baseline median ({median:.1f} {unit}, Z-score: {mod_z:.2f}). "
                f"Note: This indicates movement variability rather than physical impairment."
            )

            anomaly = AnomalyResult(
                session_id=session_id,
                athlete_id=athlete_id,
                metric_name=metric_name,
                observed_value=round(observed_val, 2),
                expected_value=round(median, 2),
                deviation_score=round(mod_z, 2),
                severity=severity,
                method="modified_zscore",
                explanation=explanation,
                created_at=datetime.now(timezone.utc)
            )
            db.add(anomaly)
            detected_anomalies.append(anomaly)

        # Optional ML Multi-variate Isolation Forest check if N >= 10
        if use_ml_isolation_forest and len(current_metrics) >= 3:
            try:
                self._run_multivariate_isolation_forest(
                    db, athlete_id, session_id, current_metrics, detected_anomalies
                )
            except Exception:
                pass

        db.flush()
        return detected_anomalies

    def _run_multivariate_isolation_forest(
        self,
        db: DbSession,
        athlete_id: uuid.UUID,
        session_id: uuid.UUID,
        current_metrics: Dict[str, float],
        anomalies_list: List[AnomalyResult]
    ) -> None:
        """
        Runs scikit-learn Isolation Forest across historical multidimensional session vectors.
        """
        # Gather historical sessions
        completed_sessions = (
            db.query(Session)
            .filter(Session.athlete_id == athlete_id, Session.processing_status == "COMPLETED")
            .order_by(Session.recorded_at.asc())
            .all()
        )

        keys = sorted(list(current_metrics.keys()))
        data_matrix: List[List[float]] = []

        for s in completed_sessions:
            poses = {p.metric_name: p.metric_value for p in s.pose_metrics}
            row = [poses.get(k, 0.0) for k in keys]
            if len(row) == len(keys):
                data_matrix.append(row)

        if len(data_matrix) < 10:
            return

        X = np.array(data_matrix)
        iso = IsolationForest(contamination=0.1, random_state=42)
        iso.fit(X)

        current_vec = np.array([[current_metrics[k] for k in keys]])
        pred = iso.predict(current_vec)[0]  # -1 is anomaly, 1 is normal
        score = float(iso.score_samples(current_vec)[0])

        if pred == -1:
            anomaly = AnomalyResult(
                session_id=session_id,
                athlete_id=athlete_id,
                metric_name="multivariate_movement_pattern",
                observed_value=round(score, 3),
                expected_value=0.0,
                deviation_score=round(abs(score), 3),
                severity="MILD",
                method="scikit_learn_isolation_forest",
                explanation=(
                    f"Multivariate pattern shift: The combination of kinematics across this session differed from your "
                    f"typical multi-metric coordination pattern (Isolation Forest anomaly score: {score:.3f})."
                ),
                created_at=datetime.now(timezone.utc)
            )
            db.add(anomaly)
            anomalies_list.append(anomaly)

anomaly_service = AnomalyService()
