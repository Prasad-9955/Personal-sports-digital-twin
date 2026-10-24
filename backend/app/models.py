import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    athlete = relationship("Athlete", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Athlete(Base):
    __tablename__ = "athletes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    sport = Column(String(50), default="running", nullable=False)
    experience_level = Column(String(50), default="intermediate", nullable=False)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="athlete")
    sessions = relationship("Session", back_populates="athlete", cascade="all, delete-orphan")
    baselines = relationship("PersonalBaseline", back_populates="athlete", cascade="all, delete-orphan")
    trends = relationship("TrendResult", back_populates="athlete", cascade="all, delete-orphan")
    twin_states = relationship("TwinState", back_populates="athlete", cascade="all, delete-orphan")
    anomalies = relationship("AnomalyResult", back_populates="athlete", cascade="all, delete-orphan")
    insights = relationship("Insight", back_populates="athlete", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="athlete", cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    video_filename = Column(String(255), nullable=False)
    video_path = Column(String(512), nullable=False)
    duration_sec = Column(Float, nullable=True)
    fps = Column(Float, nullable=True)
    resolution = Column(String(50), nullable=True)
    processing_status = Column(String(30), default="PENDING", nullable=False, index=True)  # PENDING, PROCESSING, COMPLETED, FAILED, REJECTED
    quality_score = Column(Float, nullable=True)  # 0.0 - 100.0
    error_message = Column(Text, nullable=True)
    is_demo_data = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    athlete = relationship("Athlete", back_populates="sessions")
    pose_metrics = relationship("PoseMetric", back_populates="session", cascade="all, delete-orphan")
    performance_metrics = relationship("PerformanceMetric", back_populates="session", cascade="all, delete-orphan")
    anomalies = relationship("AnomalyResult", back_populates="session", cascade="all, delete-orphan")
    insights = relationship("Insight", back_populates="session", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="session", cascade="all, delete-orphan")


class PoseMetric(Base):
    __tablename__ = "pose_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False, index=True)
    metric_value = Column(Float, nullable=False)
    unit = Column(String(30), nullable=False)
    confidence = Column(Float, nullable=False)
    frame_count = Column(Integer, default=0, nullable=False)
    metadata_json = Column(JSONB, nullable=True)

    session = relationship("Session", back_populates="pose_metrics")

    __table_args__ = (
        Index("ix_pose_metrics_session_metric", "session_id", "metric_name"),
    )


class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False, index=True)
    metric_value = Column(Float, nullable=False)
    unit = Column(String(30), nullable=False)
    measurement_method = Column(String(100), nullable=False)
    quality_score = Column(Float, nullable=False)

    session = relationship("Session", back_populates="performance_metrics")


class PersonalBaseline(Base):
    __tablename__ = "personal_baselines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False, index=True)
    baseline_value = Column(Float, nullable=False)  # Primary central tendency (median or mean)
    baseline_mean = Column(Float, nullable=False)
    baseline_median = Column(Float, nullable=False)
    dispersion_std = Column(Float, nullable=False)
    dispersion_iqr = Column(Float, nullable=False)
    method = Column(String(50), default="robust_median_iqr", nullable=False)
    window_size = Column(Integer, default=10, nullable=False)
    sample_count = Column(Integer, nullable=False)
    confidence_level = Column(String(30), default="LOW", nullable=False)  # INSUFFICIENT, LOW, MODERATE, HIGH
    calculated_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    athlete = relationship("Athlete", back_populates="baselines")

    __table_args__ = (
        Index("ix_personal_baselines_athlete_metric", "athlete_id", "metric_name"),
    )


class TrendResult(Base):
    __tablename__ = "trend_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False, index=True)
    trend_label = Column(String(30), nullable=False)  # IMPROVING, STABLE, DECLINING, INSUFFICIENT_DATA
    slope = Column(Float, nullable=False)
    r_squared = Column(Float, nullable=True)
    observation_count = Column(Integer, nullable=False)
    confidence_metadata = Column(JSONB, nullable=True)
    calculated_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    athlete = relationship("Athlete", back_populates="trends")


class AnomalyResult(Base):
    __tablename__ = "anomaly_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False)
    observed_value = Column(Float, nullable=False)
    expected_value = Column(Float, nullable=False)
    deviation_score = Column(Float, nullable=False)  # Modified Z-score or IsoForest score
    severity = Column(String(20), nullable=False)  # INFO, MILD, ELEVATED
    method = Column(String(50), default="modified_zscore", nullable=False)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    session = relationship("Session", back_populates="anomalies")
    athlete = relationship("Athlete", back_populates="anomalies")


class TwinState(Base):
    """
    The Digital Twin is a persistent, evolving software representation of an athlete.
    Each successfully analyzed session creates an immutable, auditable version snapshot.
    """
    __tablename__ = "twin_states"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True)
    state_version = Column(Integer, nullable=False)
    current_metrics = Column(JSONB, nullable=False)
    baseline_summary = Column(JSONB, nullable=False)
    trend_summary = Column(JSONB, nullable=False)
    deviation_summary = Column(JSONB, nullable=False)
    data_quality_index = Column(Float, nullable=False)
    total_sessions_tracked = Column(Integer, nullable=False, default=1)
    status_summary = Column(String(50), default="ACTIVE", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    athlete = relationship("Athlete", back_populates="twin_states")

    __table_args__ = (
        Index("ix_twin_states_athlete_version", "athlete_id", "state_version", unique=True),
    )


class Insight(Base):
    __tablename__ = "insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=True, index=True)
    insight_type = Column(String(50), nullable=False)  # PERFORMANCE, SYMMETRY, FATIGUE, BASELINE_ESTABLISHED
    structured_facts = Column(JSONB, nullable=False)
    generated_text = Column(Text, nullable=False)
    is_fallback = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    athlete = relationship("Athlete", back_populates="insights")
    session = relationship("Session", back_populates="insights")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=True, index=True)
    recommendation_text = Column(Text, nullable=False)
    supporting_metrics = Column(JSONB, nullable=False)
    rationale = Column(Text, nullable=False)
    is_fallback = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    athlete = relationship("Athlete", back_populates="recommendations")
    session = relationship("Session", back_populates="recommendations")
