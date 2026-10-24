from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DbSession
from app.database import get_db
from app.models import Athlete, Session, PersonalBaseline, TwinState
from app.schemas.twin import TwinStateResponse, TwinOverviewResponse
from app.dependencies import get_current_athlete
from app.services.twin_service import twin_service

router = APIRouter(prefix="/twin", tags=["Digital Twin"])

@router.get("", response_model=TwinOverviewResponse)
def get_current_digital_twin(
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """
    Retrieves the authoritative active state of the athlete's Personal Sports Digital Twin,
    including current metrics, personal baseline summary, trends, and deviations.
    """
    latest_state = twin_service.get_latest_twin_state(db, current_athlete.id)
    baselines = db.query(PersonalBaseline).filter(PersonalBaseline.athlete_id == current_athlete.id).all()
    
    total_sessions = (
        db.query(Session)
        .filter(Session.athlete_id == current_athlete.id, Session.processing_status == "COMPLETED")
        .count()
    )

    has_baseline = (len(baselines) > 0 and total_sessions >= 3)
    if total_sessions == 0:
        status_msg = "No sessions recorded yet. Upload your first movement video to initiate your Digital Twin."
    elif total_sessions < 3:
        status_msg = f"{total_sessions} session(s) recorded. Record {3 - total_sessions} more session(s) to establish your personal baseline."
    elif total_sessions < 5:
        status_msg = f"Preliminary personal baseline active ({total_sessions} sessions). Confidence: LOW."
    elif total_sessions < 10:
        status_msg = f"Established personal baseline active ({total_sessions} sessions). Confidence: MODERATE."
    else:
        status_msg = f"Robust longitudinal personal baseline active ({total_sessions} sessions). Confidence: HIGH."

    return TwinOverviewResponse(
        athlete_id=current_athlete.id,
        display_name=current_athlete.display_name,
        sport=current_athlete.sport,
        experience_level=current_athlete.experience_level,
        active_state=TwinStateResponse.model_validate(latest_state) if latest_state else None,
        has_baseline=has_baseline,
        baseline_status_message=status_msg,
        total_sessions=total_sessions
    )

@router.get("/history", response_model=List[TwinStateResponse])
def get_digital_twin_history(
    limit: int = 20,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """
    Returns an auditable historical sequence of versioned Digital Twin snapshots,
    demonstrating the evolution of the athlete's functional state over time.
    """
    states = (
        db.query(TwinState)
        .filter(TwinState.athlete_id == current_athlete.id)
        .order_by(TwinState.state_version.desc())
        .limit(limit)
        .all()
    )
    return states
