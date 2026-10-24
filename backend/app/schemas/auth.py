import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Minimum 6 characters")
    display_name: str = Field(..., min_length=2, max_length=100)
    sport: str = Field(default="running", max_length=50)
    experience_level: str = Field(default="intermediate")
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    athlete_id: uuid.UUID
    display_name: str
