import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class PoseMetricResponse(BaseModel):
    id: uuid.UUID
    metric_name: str
    metric_value: float
    unit: str
    confidence: float
    frame_count: int
    metadata_json: Optional[Dict[str, Any]] = None

    model_config = {"from_attributes": True}

class PerformanceMetricResponse(BaseModel):
    id: uuid.UUID
    metric_name: str
    metric_value: float
    unit: str
    measurement_method: str
    quality_score: float

    model_config = {"from_attributes": True}

class SessionResponse(BaseModel):
    id: uuid.UUID
    athlete_id: uuid.UUID
    recorded_at: datetime
    video_filename: str
    duration_sec: Optional[float] = None
    fps: Optional[float] = None
    resolution: Optional[str] = None
    processing_status: str
    quality_score: Optional[float] = None
    error_message: Optional[str] = None
    is_demo_data: bool
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class SessionDetailResponse(SessionResponse):
    pose_metrics: List[PoseMetricResponse] = []
    performance_metrics: List[PerformanceMetricResponse] = []
