import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class TrainingGoalBase(BaseModel):
    title: str = Field(..., max_length=150)
    category: str = Field(default="technique", max_length=50)
    metric_name: str = Field(..., max_length=100)
    target_direction: str = Field(default="INCREASE", max_length=20)
    baseline_value: float
    target_value: float
    current_value: float
    unit: str = Field(..., max_length=30)
    target_date: Optional[datetime] = None

class TrainingGoalCreate(TrainingGoalBase):
    pass

class TrainingGoalResponse(TrainingGoalBase):
    id: uuid.UUID
    athlete_id: uuid.UUID
    progress_pct: float
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class SkillScore(BaseModel):
    skill_name: str
    category: str
    current_score: float # 0 - 100
    benchmark_target: float # typically 85 - 100
    status: str # "DEVELOPING", "COMPETENT", "PROFICIENT", "MASTERY"
    criteria_explanation: str
    measured_parameter: str
    observed_value: str

class MilestoneEvent(BaseModel):
    day_label: str
    title: str
    description: str
    date_str: str
    achieved: bool
    session_id: Optional[str] = None
    metric_highlight: Optional[str] = None

class BiomechanicalImprovementItem(BaseModel):
    metric_name: str
    display_name: str
    unit: str
    initial_value: float
    current_value: float
    delta_value: float
    delta_pct: float
    is_favorable: bool
    scientific_significance: str

class ProgressSummaryResponse(BaseModel):
    # Category 1: Training Completion
    total_goals: int
    completed_goals: int
    in_progress_goals: int
    not_started_goals: int
    overall_goal_completion_pct: float

    # Category 2: Skill Development
    overall_skill_development_pct: float
    skills: List[SkillScore]

    # Category 3: Biomechanical Improvement
    biomechanical_improvements: List[BiomechanicalImprovementItem]
    mean_improvement_pct: float

    # Category 4: Training Consistency
    completed_sessions_count: int
    planned_sessions_count: int
    training_consistency_pct: float
    weekly_frequency_avg: float
    current_streak_days: int

    # Category 5: Estimated Time to Completion
    estimated_days_to_goals: Optional[int] = None
    projected_completion_date: Optional[str] = None
    estimation_confidence: str
    estimation_note: str

    # Category 6: Longitudinal Milestones
    milestones: List[MilestoneEvent]
