import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class CourseProgressDonut(BaseModel):
    completed_lessons: int
    in_progress_lessons: int
    not_started_lessons: int
    total_lessons: int
    overall_course_completion_pct: float

class TrainingGoalDonut(BaseModel):
    completed_goals: int
    in_progress_goals: int
    not_started_goals: int
    total_goals: int
    overall_goal_completion_pct: float

class SkillCriterionItem(BaseModel):
    skill_name: str
    category: str
    score: float  # 0.0 - 100.0
    benchmark_target: float
    status: str  # DEVELOPING, COMPETENT, PROFICIENT, MASTERY
    assessment_method: str  # MEASURED_BIOMECHANICS, QUIZ_EVALUATION, ADHERENCE_FREQUENCY
    measured_parameter: str
    observed_value: str
    explanation: str

class BiomechanicalProgressItem(BaseModel):
    metric_name: str
    display_name: str
    unit: str
    initial_value: float
    current_value: float
    baseline_median: float
    delta_value: float
    delta_pct: float
    is_favorable: bool
    quality_score: float

class ActivityPeriodSummary(BaseModel):
    period_label: str
    sessions_completed: int
    lessons_completed: int
    consistency_pct: float

class EstimatedGoalCompletion(BaseModel):
    goal_id: uuid.UUID
    goal_title: str
    start_value: float
    target_value: float
    current_value: float
    progress_pct: float
    remaining_amount: float
    unit: str
    estimated_days: Optional[int] = None
    estimated_completion_date: Optional[str] = None
    has_enough_history: bool
    estimation_note: str

class TimelineEventItem(BaseModel):
    id: uuid.UUID
    event_type: str  # COURSE_ENROLLED, LESSON_COMPLETED, QUIZ_PASSED, VIDEO_ANALYSIS, BASELINE_ESTABLISHED, GOAL_ACHIEVED
    title: str
    description: str
    source_ref_id: Optional[str] = None
    metric_highlight: Optional[str] = None
    achieved_at: datetime
    date_formatted: str

    model_config = ConfigDict(from_attributes=True)

class MyDevelopmentResponse(BaseModel):
    course_progress: CourseProgressDonut
    goal_progress: TrainingGoalDonut
    skills: List[SkillCriterionItem]
    biomechanical_progress: List[BiomechanicalProgressItem]
    weekly_activity: List[ActivityPeriodSummary]
    monthly_activity: List[ActivityPeriodSummary]
    estimated_goals: List[EstimatedGoalCompletion]
    twin_version: int
    total_sessions_tracked: int
