import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class TwinStateResponse(BaseModel):
    id: uuid.UUID
    athlete_id: uuid.UUID
    state_version: int
    current_metrics: Dict[str, Any]
    baseline_summary: Dict[str, Any]
    trend_summary: Dict[str, Any]
    deviation_summary: Dict[str, Any]
    data_quality_index: float
    total_sessions_tracked: int
    status_summary: str
    created_at: datetime

    model_config = {"from_attributes": True}

class TwinOverviewResponse(BaseModel):
    athlete_id: uuid.UUID
    display_name: str
    sport: str
    experience_level: str
    active_state: Optional[TwinStateResponse] = None
    has_baseline: bool = False
    baseline_status_message: str = "Insufficient data to establish personal baseline."
    total_sessions: int = 0
