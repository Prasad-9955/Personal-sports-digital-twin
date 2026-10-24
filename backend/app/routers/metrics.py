from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DbSession
from app.database import get_db
from app.models import Athlete, Session, PoseMetric, PerformanceMetric, PersonalBaseline, AnomalyResult
from app.schemas.analytics import MetricHistoryResponse, MetricHistoryPoint
from app.dependencies import get_current_athlete

router = APIRouter(prefix="/metrics", tags=["Metrics & History"])

@router.get("/history/{metric_name}", response_model=MetricHistoryResponse)
def get_metric_history(
    metric_name: str,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """
    Returns chronological historical time-series data points for a specific metric,
    annotated with the athlete's personal baseline and deviation boundaries for Flutter charting.
    """
    # Fetch all completed sessions for this athlete chronologically
    sessions = (
        db.query(Session)
        .filter(Session.athlete_id == current_athlete.id, Session.processing_status == "COMPLETED")
        .order_by(Session.recorded_at.asc())
        .all()
    )

    if not sessions:
        return MetricHistoryResponse(metric_name=metric_name, unit="", points=[])

    session_ids = [s.id for s in sessions]
    session_map = {s.id: s.recorded_at for s in sessions}

    # Retrieve metric records
    pose_records = (
        db.query(PoseMetric)
        .filter(PoseMetric.session_id.in_(session_ids), PoseMetric.metric_name == metric_name)
        .all()
    )
    perf_records = (
        db.query(PerformanceMetric)
        .filter(PerformanceMetric.session_id.in_(session_ids), PerformanceMetric.metric_name == metric_name)
        .all()
    )

    unit = ""
    points_dict = {}

    for p in pose_records:
        unit = p.unit
        points_dict[p.session_id] = {
            "value": p.metric_value,
            "confidence": p.confidence
        }

    for pf in perf_records:
        unit = pf.unit
        points_dict[pf.session_id] = {
            "value": pf.metric_value,
            "confidence": pf.quality_score / 100.0
        }

    # Fetch baseline for this metric
    baseline = (
        db.query(PersonalBaseline)
        .filter(PersonalBaseline.athlete_id == current_athlete.id, PersonalBaseline.metric_name == metric_name)
        .first()
    )
    b_val = baseline.baseline_median if baseline else None
    b_iqr = baseline.dispersion_iqr if baseline else None
    b_lower = (b_val - b_iqr) if (b_val is not None and b_iqr is not None) else None
    b_upper = (b_val + b_iqr) if (b_val is not None and b_iqr is not None) else None

    # Fetch anomalies for this metric
    anomalies = (
        db.query(AnomalyResult)
        .filter(AnomalyResult.athlete_id == current_athlete.id, AnomalyResult.metric_name == metric_name)
        .all()
    )
    anomaly_session_ids = {a.session_id for a in anomalies}

    points: List[MetricHistoryPoint] = []
    for s in sessions:
        if s.id in points_dict:
            item = points_dict[s.id]
            points.append(
                MetricHistoryPoint(
                    session_id=s.id,
                    recorded_at=s.recorded_at,
                    metric_value=item["value"],
                    confidence=item["confidence"],
                    baseline_value=b_val,
                    baseline_lower=b_lower,
                    baseline_upper=b_upper,
                    is_anomaly=(s.id in anomaly_session_ids)
                )
            )

    return MetricHistoryResponse(
        metric_name=metric_name,
        unit=unit or "units",
        points=points
    )
