from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DbSession
from app.database import get_db
from app.models import Athlete
from app.schemas.athlete import AthleteResponse, AthleteUpdate
from app.dependencies import get_current_athlete

router = APIRouter(prefix="/athletes", tags=["Athlete Profile"])

@router.get("/me", response_model=AthleteResponse)
def get_my_profile(current_athlete: Athlete = Depends(get_current_athlete)):
    """Retrieves current authenticated athlete profile."""
    return current_athlete

@router.put("/me", response_model=AthleteResponse)
def update_my_profile(
    update_data: AthleteUpdate,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """Updates profile attributes for the current athlete."""
    if update_data.display_name is not None:
        current_athlete.display_name = update_data.display_name
    if update_data.sport is not None:
        current_athlete.sport = update_data.sport
    if update_data.experience_level is not None:
        current_athlete.experience_level = update_data.experience_level
    if update_data.height_cm is not None:
        current_athlete.height_cm = update_data.height_cm
    if update_data.weight_kg is not None:
        current_athlete.weight_kg = update_data.weight_kg

    db.commit()
    db.refresh(current_athlete)
    return current_athlete
