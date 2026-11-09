import pytest
from app.routers.goals import calculate_goal_progress
from app.models import TrainingGoal
from app.schemas.goal import (
    TrainingGoalCreate,
    TrainingGoalResponse,
    SkillScore,
    BiomechanicalImprovementItem,
    ProgressSummaryResponse
)

def test_calculate_goal_progress_increase():
    goal = TrainingGoal(
        title="Increase Cadence",
        metric_name="step_cadence",
        target_direction="INCREASE",
        baseline_value=150.0,
        target_value=170.0,
        current_value=150.0,
        unit="spm"
    )
    # Baseline: 0%
    pct = calculate_goal_progress(goal, 150.0)
    assert pct == 0.0
    assert goal.status == "NOT_STARTED"

    # Halfway: 50%
    pct = calculate_goal_progress(goal, 160.0)
    assert pct == 50.0
    assert goal.status == "IN_PROGRESS"

    # Reached: 100%
    pct = calculate_goal_progress(goal, 170.0)
    assert pct == 100.0
    assert goal.status == "COMPLETED"

    # Exceeded: clamped to 100%
    pct = calculate_goal_progress(goal, 180.0)
    assert pct == 100.0
    assert goal.status == "COMPLETED"

def test_calculate_goal_progress_decrease():
    goal = TrainingGoal(
        title="Reduce Trunk Forward Lean",
        metric_name="trunk_inclination_angle",
        target_direction="DECREASE",
        baseline_value=14.0,
        target_value=8.0,
        current_value=14.0,
        unit="degrees"
    )
    # Halfway: 50%
    pct = calculate_goal_progress(goal, 11.0)
    assert pct == 50.0
    assert goal.status == "IN_PROGRESS"

    # Below target: 100%
    pct = calculate_goal_progress(goal, 7.5)
    assert pct == 100.0
    assert goal.status == "COMPLETED"

    # Worsened (higher than baseline): clamped to 0%
    pct = calculate_goal_progress(goal, 16.0)
    assert pct == 0.0
    assert goal.status == "NOT_STARTED"

def test_schemas_validation():
    skill = SkillScore(
        skill_name="Running Technique",
        category="Biomechanical Form",
        current_score=85.0,
        benchmark_target=90.0,
        status="PROFICIENT",
        criteria_explanation="Evaluated from coordinated trunk inclination.",
        measured_parameter="Trunk & Knee Coordination",
        observed_value="85.0/100 Index"
    )
    assert skill.current_score == 85.0

    bio = BiomechanicalImprovementItem(
        metric_name="bilateral_symmetry_index",
        display_name="Bilateral Symmetry Index",
        unit="%",
        initial_value=11.4,
        current_value=4.8,
        delta_value=-6.6,
        delta_pct=57.9,
        is_favorable=True,
        scientific_significance="Significant reduction in gait asymmetry."
    )
    assert bio.is_favorable is True
    assert bio.delta_pct == 57.9
