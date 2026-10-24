from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DbSession
from app.database import get_db
from app.models import Athlete, TrendResult
from app.schemas.analytics import TrendResponse
from app.dependencies import get_current_athlete

router = APIRouter(prefix="/trends", tags=["Trends"])

@router.get("", response_model=List[TrendResponse])
def get_athlete_trends(
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """Retrieves computed longitudinal trends across all metrics for the authenticated athlete."""
    trends = (
        db.query(TrendResult)
        .filter(TrendResult.athlete_id == current_athlete.id)
        .all()
    )
    return trends
