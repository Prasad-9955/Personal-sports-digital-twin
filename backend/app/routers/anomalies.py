from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DbSession
from app.database import get_db
from app.models import Athlete, AnomalyResult
from app.schemas.analytics import AnomalyResponse
from app.dependencies import get_current_athlete

router = APIRouter(prefix="/anomalies", tags=["Deviations & Anomalies"])

@router.get("", response_model=List[AnomalyResponse])
def get_athlete_anomalies(
    limit: int = 50,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """Retrieves detected statistical deviations from the athlete's personal baseline history."""
    anomalies = (
        db.query(AnomalyResult)
        .filter(AnomalyResult.athlete_id == current_athlete.id)
        .order_by(AnomalyResult.created_at.desc())
        .limit(limit)
        .all()
    )
    return anomalies
