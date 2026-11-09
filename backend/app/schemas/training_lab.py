import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class SampleDatasetResponse(BaseModel):
    id: uuid.UUID
    name: str
    provider: str
    description: str
    source_url: Optional[str] = None
    licence_type: str
    licence_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SampleVideoResponse(BaseModel):
    id: uuid.UUID
    dataset_id: Optional[uuid.UUID] = None
    dataset: Optional[SampleDatasetResponse] = None
    title: str
    category: str
    description: str
    difficulty_level: str
    duration_sec: float
    camera_angle: str
    video_filename: str
    video_url: str
    thumbnail_url: Optional[str] = None
    fps: Optional[float] = None
    resolution: Optional[str] = None
    benchmark_metrics: Optional[Dict[str, Any]] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SampleAnalysisResponse(BaseModel):
    id: uuid.UUID
    sample_video_id: uuid.UUID
    sample_video_title: str
    category: str
    camera_angle: str
    quality_score: float
    metrics_summary: Dict[str, Any]
    is_demo_data: bool = True
    demonstration_notice: str = Field(
        default="DEMONSTRATION DATA ONLY. This run does NOT alter or contaminate your personal baseline or Digital Twin state."
    )
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
