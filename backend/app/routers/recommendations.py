from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DbSession
from app.database import get_db
from app.models import Athlete, Recommendation, Insight
from app.schemas.analytics import RecommendationResponse, InsightResponse
from app.dependencies import get_current_athlete

router = APIRouter(tags=["Insights & Recommendations"])

@router.get("/recommendations", response_model=List[RecommendationResponse])
def get_athlete_recommendations(
    limit: int = 20,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """Retrieves grounded coaching recommendations generated for the athlete."""
    recs = (
        db.query(Recommendation)
        .filter(Recommendation.athlete_id == current_athlete.id)
        .order_by(Recommendation.created_at.desc())
        .limit(limit)
        .all()
    )
    return recs

@router.get("/insights", response_model=List[InsightResponse])
def get_athlete_insights(
    limit: int = 20,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """Retrieves evidence-grounded natural language insights explaining the athlete's progression."""
    insights = (
        db.query(Insight)
        .filter(Insight.athlete_id == current_athlete.id)
        .order_by(Insight.created_at.desc())
        .limit(limit)
        .all()
    )
    return insights
