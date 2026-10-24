import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class BaselineResponse(BaseModel):
    id: uuid.UUID
    athlete_id: uuid.UUID
    metric_name: str
    baseline_value: float
    baseline_mean: float
    baseline_median: float
    dispersion_std: float
    dispersion_iqr: float
    method: str
    sample_count: int
    confidence_level: str
    calculated_at: datetime

    model_config = {"from_attributes": True}

class TrendResponse(BaseModel):
    id: uuid.UUID
    athlete_id: uuid.UUID
    metric_name: str
    trend_label: str
    slope: float
    r_squared: Optional[float] = None
    observation_count: int
    confidence_metadata: Optional[Dict[str, Any]] = None
    calculated_at: datetime

    model_config = {"from_attributes": True}

class AnomalyResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    athlete_id: uuid.UUID
    metric_name: str
    observed_value: float
    expected_value: float
    deviation_score: float
    severity: str
    method: str
    explanation: str
    created_at: datetime

    model_config = {"from_attributes": True}

class MetricHistoryPoint(BaseModel):
    session_id: uuid.UUID
    recorded_at: datetime
    metric_value: float
    confidence: float
    baseline_value: Optional[float] = None
    baseline_lower: Optional[float] = None
    baseline_upper: Optional[float] = None
    is_anomaly: bool = False

class MetricHistoryResponse(BaseModel):
    metric_name: str
    unit: str
    points: List[MetricHistoryPoint]

class RecommendationResponse(BaseModel):
    id: uuid.UUID
    athlete_id: uuid.UUID
    session_id: Optional[uuid.UUID] = None
    recommendation_text: str
    supporting_metrics: Dict[str, Any]
    rationale: str
    is_fallback: bool
    created_at: datetime

    model_config = {"from_attributes": True}

class InsightResponse(BaseModel):
    id: uuid.UUID
    athlete_id: uuid.UUID
    session_id: Optional[uuid.UUID] = None
    insight_type: str
    structured_facts: Dict[str, Any]
    generated_text: str
    is_fallback: bool
    created_at: datetime

    model_config = {"from_attributes": True}
