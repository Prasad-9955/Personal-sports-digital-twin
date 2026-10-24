import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

class AthleteCreate(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=100)
    sport: str = Field(default="running", max_length=50)
    experience_level: str = Field(default="intermediate")
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None

class AthleteUpdate(BaseModel):
    display_name: Optional[str] = None
    sport: Optional[str] = None
    experience_level: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None

class AthleteResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    display_name: str
    sport: str
    experience_level: str
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
