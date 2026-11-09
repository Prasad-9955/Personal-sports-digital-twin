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
    UniqueConstraint,
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
    training_goals = relationship("TrainingGoal", back_populates="athlete", cascade="all, delete-orphan")
    course_enrollments = relationship("CourseEnrollment", back_populates="athlete", cascade="all, delete-orphan")
    sample_analysis_runs = relationship("SampleAnalysisRun", back_populates="athlete", cascade="all, delete-orphan")
    milestones = relationship("TrainingMilestone", back_populates="athlete", cascade="all, delete-orphan")


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


class TrainingGoal(Base):
    """
    Measurable athletic and biomechanical training goal.
    Calculates progress against longitudinal session observations and personal baselines.
    """
    __tablename__ = "training_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(50), default="technique", nullable=False)  # cadence, symmetry, trunk_angle, knee_flexion, consistency, volume
    metric_name = Column(String(100), nullable=False)
    target_direction = Column(String(20), default="INCREASE", nullable=False)  # INCREASE, DECREASE, MAINTAIN, RANGE
    baseline_value = Column(Float, nullable=False)
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, nullable=False)
    unit = Column(String(30), nullable=False)
    progress_pct = Column(Float, default=0.0, nullable=False)  # 0.0 - 100.0
    status = Column(String(30), default="IN_PROGRESS", nullable=False)  # NOT_STARTED, IN_PROGRESS, COMPLETED
    target_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    athlete = relationship("Athlete", back_populates="training_goals")
    progress_history = relationship("GoalProgressHistory", back_populates="goal", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_training_goals_athlete_status", "athlete_id", "status"),
    )


class SampleDataset(Base):
    """
    Public biomechanical movement datasets (Health&Gait, Running Injury Clinic, etc.)
    Provides reference metadata, licensing, and benchmark citation.
    """
    __tablename__ = "sample_datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), unique=True, nullable=False)
    provider = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    source_url = Column(String(512), nullable=True)
    licence_type = Column(String(100), nullable=False)
    licence_url = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    videos = relationship("SampleVideo", back_populates="dataset", cascade="all, delete-orphan")


class SampleVideo(Base):
    """
    Preloaded curated sample running and gait videos for demonstration and technique study.
    Analysis runs on these videos are STRICTLY isolated and NEVER alter personal baselines or Twin states.
    """
    __tablename__ = "sample_videos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("sample_datasets.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False, index=True)  # beginner_running, normal_running, fast_running, walking_gait, camera_angles
    description = Column(Text, nullable=False)
    difficulty_level = Column(String(30), nullable=False)  # BEGINNER, INTERMEDIATE, ADVANCED
    duration_sec = Column(Float, nullable=False)
    camera_angle = Column(String(50), nullable=False)  # sagittal_lateral, frontal_anterior, posterior, oblique
    video_filename = Column(String(255), nullable=False)
    video_url = Column(String(512), nullable=False)
    thumbnail_url = Column(String(512), nullable=True)
    fps = Column(Float, nullable=True)
    resolution = Column(String(50), nullable=True)
    benchmark_metrics = Column(JSONB, nullable=True)  # Ground-truth angles, cadence, symmetry
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    dataset = relationship("SampleDataset", back_populates="videos")
    analysis_runs = relationship("SampleAnalysisRun", back_populates="sample_video", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_sample_videos_category_angle", "category", "camera_angle"),
    )


class SampleAnalysisRun(Base):
    """
    Records MediaPipe and OpenCV analysis executions performed on sample videos.
    STRICT BARRIER: Clearly flagged as is_demo_data=True. Does NOT update the athlete's Personal Twin.
    """
    __tablename__ = "sample_analysis_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sample_video_id = Column(UUID(as_uuid=True), ForeignKey("sample_videos.id", ondelete="CASCADE"), nullable=False, index=True)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True)
    quality_score = Column(Float, nullable=False)
    metrics_summary = Column(JSONB, nullable=False)  # Extracted trunk, knee flexion L/R, cadence, symmetry
    pose_landmarks = Column(JSONB, nullable=True)
    is_demo_data = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    sample_video = relationship("SampleVideo", back_populates="analysis_runs")
    athlete = relationship("Athlete", back_populates="sample_analysis_runs")


class Course(Base):
    """
    Training Academy sports courses structured by curriculum levels.
    """
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    level = Column(String(30), nullable=False)  # BEGINNER, INTERMEDIATE, ADVANCED
    estimated_duration_min = Column(Integer, nullable=False)
    thumbnail_url = Column(String(512), nullable=True)
    order_index = Column(Integer, default=0, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    modules = relationship("CourseModule", back_populates="course", cascade="all, delete-orphan", order_by="CourseModule.order_index")
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")


class CourseModule(Base):
    """
    Subdivisions within a training academy course.
    """
    __tablename__ = "course_modules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    course = relationship("Course", back_populates="modules")
    lessons = relationship("CourseLesson", back_populates="module", cascade="all, delete-orphan", order_by="CourseLesson.order_index")


class CourseLesson(Base):
    """
    Individual lesson units within a course module.
    Types: VIDEO, TEXT, DEMO, PRACTICAL, QUIZ, ASSIGNMENT.
    """
    __tablename__ = "course_lessons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    module_id = Column(UUID(as_uuid=True), ForeignKey("course_modules.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    lesson_type = Column(String(30), nullable=False)  # VIDEO, TEXT, DEMO, PRACTICAL, QUIZ, ASSIGNMENT
    content_text = Column(Text, nullable=True)
    video_url = Column(String(512), nullable=True)
    duration_min = Column(Integer, default=10, nullable=False)
    quiz_data = Column(JSONB, nullable=True)  # List of { question, options, correct_index, explanation }
    assignment_instructions = Column(Text, nullable=True)
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    module = relationship("CourseModule", back_populates="lessons")
    progress_records = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")


class CourseEnrollment(Base):
    """
    Athlete's active or completed enrolment in a course.
    Tracks overall progress percentage and status.
    """
    __tablename__ = "course_enrollments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(30), default="ACTIVE", nullable=False)  # ACTIVE, COMPLETED, ARCHIVED
    progress_pct = Column(Float, default=0.0, nullable=False)
    enrolled_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    last_accessed_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    athlete = relationship("Athlete", back_populates="course_enrollments")
    course = relationship("Course", back_populates="enrollments")
    lesson_progress = relationship("LessonProgress", back_populates="enrollment", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("athlete_id", "course_id", name="uq_athlete_course_enrollment"),
    )


class LessonProgress(Base):
    """
    Granular completion tracking for an individual lesson within an enrolment.
    """
    __tablename__ = "lesson_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enrollment_id = Column(UUID(as_uuid=True), ForeignKey("course_enrollments.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("course_lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(30), default="NOT_STARTED", nullable=False)  # NOT_STARTED, IN_PROGRESS, COMPLETED
    quiz_score = Column(Float, nullable=True)  # 0.0 - 100.0 score if quiz
    completed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    enrollment = relationship("CourseEnrollment", back_populates="lesson_progress")
    lesson = relationship("CourseLesson", back_populates="progress_records")

    __table_args__ = (
        UniqueConstraint("enrollment_id", "lesson_id", name="uq_enrollment_lesson_progress"),
    )


class GoalProgressHistory(Base):
    """
    Chronological progress snapshots recorded as an athlete logs training sessions.
    """
    __tablename__ = "goal_progress_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    goal_id = Column(UUID(as_uuid=True), ForeignKey("training_goals.id", ondelete="CASCADE"), nullable=False, index=True)
    observed_value = Column(Float, nullable=False)
    progress_pct = Column(Float, nullable=False)
    recorded_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    goal = relationship("TrainingGoal", back_populates="progress_history")


class TrainingMilestone(Base):
    """
    Chronological timeline events marking athletic, academic, and biomechanical achievements.
    Sources: COURSE_ENROLLED, LESSON_COMPLETED, QUIZ_PASSED, VIDEO_ANALYSIS, BASELINE_ESTABLISHED, GOAL_ACHIEVED.
    """
    __tablename__ = "training_milestones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    source_ref_id = Column(String(100), nullable=True)
    metric_highlight = Column(String(150), nullable=True)
    achieved_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    athlete = relationship("Athlete", back_populates="milestones")

    __table_args__ = (
        Index("ix_training_milestones_athlete_time", "athlete_id", "achieved_at"),
    )
