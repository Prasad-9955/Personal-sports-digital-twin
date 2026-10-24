import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session as DbSession
from app.database import get_db
from app.models import Athlete, Session, PoseMetric, PerformanceMetric, AnomalyResult, TwinState
from app.schemas.session import SessionResponse, SessionDetailResponse
from app.dependencies import get_current_athlete
from app.services.video_service import video_service
from app.services.pose_service import pose_service
from app.services.metric_service import metric_service
from app.services.baseline_service import baseline_service
from app.services.trend_service import trend_service
from app.services.anomaly_service import anomaly_service
from app.services.twin_service import twin_service
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/sessions", tags=["Sessions & Video Analysis"])

@router.post("/upload", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def upload_session_video(
    file: UploadFile = File(...),
    recorded_at: Optional[str] = Form(None),
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """
    Uploads a movement video, verifies decodability and duration with OpenCV,
    and initializes an auditable session in PENDING state.
    """
    # 1. Save and validate file format and size
    stored_filename, video_path = video_service.validate_and_save_upload(file)

    # 2. Inspect video metadata with OpenCV
    try:
        meta = video_service.inspect_video(video_path)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    rec_time = datetime.now(timezone.utc)
    if recorded_at:
        try:
            rec_time = datetime.fromisoformat(recorded_at.replace("Z", "+00:00"))
        except Exception:
            pass

    # 3. Create Session Record in PostgreSQL
    new_session = Session(
        athlete_id=current_athlete.id,
        recorded_at=rec_time,
        video_filename=stored_filename,
        video_path=video_path,
        duration_sec=meta["duration_sec"],
        fps=meta["fps"],
        resolution=meta["resolution"],
        processing_status="PENDING",
        quality_score=None,
        is_demo_data=False,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session

@router.post("/{session_id}/process", response_model=SessionDetailResponse)
def process_session(
    session_id: uuid.UUID,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """
    Authoritative processing pipeline:
    1. Extracts 33 BlazePose landmarks
    2. Calculates biomechanical metrics (angles, symmetry index, cadence)
    3. Updates personal baselines
    4. Evaluates trends
    5. Detects anomalies / deviations
    6. Updates Digital Twin state
    7. Generates grounded Gemini explanations
    """
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    # Enforce athlete ownership
    if session.athlete_id != current_athlete.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this session")

    # Idempotency check: prevent duplicate state updates if already completed
    if session.processing_status == "COMPLETED":
        return session

    session.processing_status = "PROCESSING"
    db.commit()

    try:
        # Step 1: MediaPipe Landmark Extraction & Tracking Quality Assessment
        pose_data = pose_service.extract_landmarks_from_video(session.video_path)

        if not pose_data["is_acceptable"]:
            session.processing_status = "REJECTED"
            session.quality_score = pose_data["quality_score"]
            session.error_message = (
                f"Video quality insufficient ({pose_data['quality_score']:.1f}%). "
                f"Only {pose_data['processed_frames']} valid poses detected. Please ensure full body visibility and good lighting."
            )
            db.commit()
            db.refresh(session)
            return session

        # Step 2: Biomechanical Kinematic & Cadence Feature Extraction
        metrics_data = metric_service.extract_session_metrics(pose_data)
        session.quality_score = metrics_data["quality_score"]

        # Step 3: Store Pose Metrics
        for pm in metrics_data["pose_metrics"]:
            p_record = PoseMetric(
                session_id=session.id,
                metric_name=pm["metric_name"],
                metric_value=pm["metric_value"],
                unit=pm["unit"],
                confidence=pm["confidence"],
                frame_count=pm["frame_count"],
                metadata_json=pm["metadata_json"]
            )
            db.add(p_record)

        # Step 4: Store Performance Metrics
        for pfm in metrics_data["performance_metrics"]:
            pf_record = PerformanceMetric(
                session_id=session.id,
                metric_name=pfm["metric_name"],
                metric_value=pfm["metric_value"],
                unit=pfm["unit"],
                measurement_method=pfm["measurement_method"],
                quality_score=pfm["quality_score"]
            )
            db.add(pf_record)

        session.processing_status = "COMPLETED"
        session.completed_at = datetime.now(timezone.utc)
        db.flush()

        # Step 5: Update Longitudinal Personal Baselines
        baselines = baseline_service.calculate_athlete_baselines(db, current_athlete.id)

        # Step 6: Update Longitudinal Metric Trends
        trends = trend_service.calculate_athlete_trends(db, current_athlete.id)

        # Step 7: Detect Deviations against Personal Baseline
        anomalies = anomaly_service.detect_session_deviations(db, current_athlete.id, session.id)

        # Step 8: Update Digital Twin State Snapshot
        twin_state = twin_service.update_twin_state(db, current_athlete.id, session.id)

        # Step 9: Grounded Gemini Explanation & Recommendation
        structured_facts = {
            "session_id": str(session.id),
            "data_quality_score": session.quality_score,
            "current_metrics": twin_state.current_metrics,
            "baseline_summary": twin_state.baseline_summary,
            "trend_summary": twin_state.trend_summary,
            "deviations": twin_state.deviation_summary,
            "total_sessions_tracked": twin_state.total_sessions_tracked
        }
        gemini_service.generate_explanation_and_recommendations(
            db, current_athlete.id, session.id, structured_facts
        )

        db.commit()
        db.refresh(session)
        return session

    except Exception as e:
        db.rollback()
        session.processing_status = "FAILED"
        session.error_message = f"Processing error: {str(e)}"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while analyzing the movement video: {str(e)}"
        )

@router.get("", response_model=List[SessionResponse])
def list_sessions(
    limit: int = 50,
    offset: int = 0,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """Lists historical sessions for the current authenticated athlete."""
    sessions = (
        db.query(Session)
        .filter(Session.athlete_id == current_athlete.id)
        .order_by(Session.recorded_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return sessions

@router.get("/{session_id}", response_model=SessionDetailResponse)
def get_session_detail(
    session_id: uuid.UUID,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """Retrieves session details and its extracted pose and performance metrics."""
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if session.athlete_id != current_athlete.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return session
