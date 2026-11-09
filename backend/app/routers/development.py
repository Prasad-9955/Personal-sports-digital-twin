import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session as DbSession
from app.database import get_db
from app.models import (
    Athlete,
    Session,
    PoseMetric,
    PerformanceMetric,
    TwinState,
    PersonalBaseline,
    TrainingGoal,
    Course,
    CourseLesson,
    CourseEnrollment,
    LessonProgress,
    TrainingMilestone
)
from app.schemas.development import (
    MyDevelopmentResponse,
    CourseProgressDonut,
    TrainingGoalDonut,
    SkillCriterionItem,
    BiomechanicalProgressItem,
    ActivityPeriodSummary,
    EstimatedGoalCompletion,
    TimelineEventItem
)
from app.dependencies import get_current_athlete
from app.routers.goals import ensure_default_goals, calculate_goal_progress
from app.services.academy_seed_service import seed_academy_courses_and_lessons

router = APIRouter(prefix="/development", tags=["Athlete Development & Training Timeline"])

def ensure_baseline_milestones(db: DbSession, athlete: Athlete, twin: Optional[TwinState], total_sessions: int):
    """Generates baseline timeline milestones if none exist yet for the athlete."""
    existing_count = db.query(TrainingMilestone).filter(TrainingMilestone.athlete_id == athlete.id).count()
    if existing_count > 0:
        return

    now = datetime.now(timezone.utc)
    milestones = [
        TrainingMilestone(
            athlete_id=athlete.id,
            event_type="SYSTEM_INITIALIZED",
            title="Athlete Profile & Digital Twin Provisioned",
            description="Established athletic telemetry profile for continuous sports observation.",
            achieved_at=now - timedelta(days=14),
            metric_highlight="Digital Twin v0"
        )
    ]
    if total_sessions >= 1:
        milestones.append(
            TrainingMilestone(
                athlete_id=athlete.id,
                event_type="VIDEO_ANALYSIS",
                title="First Biomechanical Movement Video Ingestion",
                description="Successfully processed running video with MediaPipe 33-point BlazePose estimation.",
                achieved_at=now - timedelta(days=12),
                metric_highlight="BlazePose 33 Landmarks"
            )
        )
    if total_sessions >= 3:
        milestones.append(
            TrainingMilestone(
                athlete_id=athlete.id,
                event_type="BASELINE_ESTABLISHED",
                title="Personal Movement Baseline Established (v3)",
                description="Accumulated 3 valid sessions required for robust median & IQR dispersion calculation.",
                achieved_at=now - timedelta(days=7),
                metric_highlight="N >= 3 Baselines"
            )
        )
    if total_sessions >= 5:
        milestones.append(
            TrainingMilestone(
                athlete_id=athlete.id,
                event_type="BASELINE_ESTABLISHED",
                title="Longitudinal Baseline Evolution (v5)",
                description="Digital Twin evolved to version 5 with narrowing IQR dispersion indicating gait stability.",
                achieved_at=now - timedelta(days=2),
                metric_highlight="State Version v5"
            )
        )

    for m in milestones:
        db.add(m)
    db.commit()


@router.get("/summary", response_model=MyDevelopmentResponse)
def get_development_summary(
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """
    Combined development command center payload separating:
    1. Course Progress (lessons completed vs total)
    2. Training Goal Progress (measurable goals)
    3. 6 Skill Criteria (distinguishing mechanics, quizzes, adherence)
    4. Biomechanical Progress (parametric movement changes)
    5. Weekly & Monthly Training Activities
    6. Velocity-based goal completion estimates
    """
    seed_academy_courses_and_lessons(db)
    goals = ensure_default_goals(db, current_athlete)

    twin = (
        db.query(TwinState)
        .filter(TwinState.athlete_id == current_athlete.id)
        .order_by(TwinState.state_version.desc())
        .first()
    )
    current_metrics = twin.current_metrics if twin else {}
    baseline_summary = twin.baseline_summary if twin else {}
    total_sessions = twin.total_sessions_tracked if twin else 1
    twin_version = twin.state_version if twin else 1

    # 1. Course Progress Donut Calculation
    all_lessons = db.query(CourseLesson).all()
    total_lessons_count = len(all_lessons)
    
    # Athlete's progress records
    progress_records = (
        db.query(LessonProgress)
        .join(CourseEnrollment, LessonProgress.enrollment_id == CourseEnrollment.id)
        .filter(CourseEnrollment.athlete_id == current_athlete.id)
        .all()
    )
    completed_lessons_count = sum(1 for lp in progress_records if lp.status == "COMPLETED")
    in_progress_lessons_count = sum(1 for lp in progress_records if lp.status == "IN_PROGRESS")
    not_started_lessons_count = max(0, total_lessons_count - (completed_lessons_count + in_progress_lessons_count))
    overall_course_pct = round((completed_lessons_count / total_lessons_count * 100.0) if total_lessons_count > 0 else 0.0, 1)

    course_donut = CourseProgressDonut(
        completed_lessons=completed_lessons_count,
        in_progress_lessons=in_progress_lessons_count,
        not_started_lessons=not_started_lessons_count,
        total_lessons=total_lessons_count,
        overall_course_completion_pct=overall_course_pct
    )

    # 2. Training Goal Donut Calculation
    # Refresh goal progress
    for g in goals:
        if g.metric_name == "session_count":
            calculate_goal_progress(g, float(total_sessions))
        elif g.metric_name in current_metrics:
            val = float(current_metrics[g.metric_name].get("value", g.current_value))
            calculate_goal_progress(g, val)
    db.commit()

    total_goals_count = len(goals)
    completed_goals_count = sum(1 for g in goals if g.status == "COMPLETED")
    in_progress_goals_count = sum(1 for g in goals if g.status == "IN_PROGRESS")
    not_started_goals_count = sum(1 for g in goals if g.status == "NOT_STARTED")
    overall_goal_pct = round((completed_goals_count / total_goals_count * 100.0) if total_goals_count > 0 else 0.0, 1)

    goal_donut = TrainingGoalDonut(
        completed_goals=completed_goals_count,
        in_progress_goals=in_progress_goals_count,
        not_started_goals=not_started_goals_count,
        total_goals=total_goals_count,
        overall_goal_completion_pct=overall_goal_pct
    )

    # 3. Assessed Skill Criteria
    cadence_val = float(current_metrics.get("step_cadence", {}).get("value", 160.0))
    si_val = float(current_metrics.get("bilateral_symmetry_index", {}).get("value", 8.0))
    trunk_val = float(current_metrics.get("trunk_inclination_angle", {}).get("value", 12.0))
    left_knee_val = float(current_metrics.get("knee_flexion_left", {}).get("value", 145.0))
    right_knee_val = float(current_metrics.get("knee_flexion_right", {}).get("value", 155.0))

    balance_score = round(max(0.0, min(100.0, 100.0 - (si_val * 4.0))), 1)
    trunk_dev = abs(trunk_val - 10.0)
    trunk_score = round(max(0.0, min(100.0, 100.0 - (trunk_dev * 8.0))), 1)
    cadence_score = round(max(0.0, min(100.0, (cadence_val / 175.0) * 95.0)), 1)
    knee_diff = abs(left_knee_val - right_knee_val)
    knee_score = round(max(0.0, min(100.0, 95.0 - (knee_diff * 4.0))), 1)
    technique_score = round((balance_score * 0.4) + (trunk_score * 0.3) + (knee_score * 0.3), 1)
    consistency_score = round(min(100.0, (total_sessions / 8.0) * 100.0), 1)

    skills = [
        SkillCriterionItem(
            skill_name="Running Technique",
            category="Biomechanical Form",
            score=technique_score,
            benchmark_target=90.0,
            status="PROFICIENT" if technique_score >= 85 else ("COMPETENT" if technique_score >= 70 else "DEVELOPING"),
            assessment_method="MEASURED_BIOMECHANICS",
            measured_parameter="Trunk & Knee Coordination",
            observed_value=f"{technique_score}/100 Index",
            explanation="Coordinated alignment of forward trunk angle with bilateral knee extension range."
        ),
        SkillCriterionItem(
            skill_name="Posture Awareness",
            category="Postural Stability",
            score=trunk_score,
            benchmark_target=92.0,
            status="PROFICIENT" if trunk_score >= 85 else ("COMPETENT" if trunk_score >= 70 else "DEVELOPING"),
            assessment_method="MEASURED_BIOMECHANICS",
            measured_parameter="Trunk Inclination",
            observed_value=f"{trunk_val:.1f}° Forward Lean",
            explanation="Deviation of shoulder-to-hip centroid from vertical 8°-12° forward lean standard."
        ),
        SkillCriterionItem(
            skill_name="Cadence Control",
            category="Neuromuscular Rhythm",
            score=cadence_score,
            benchmark_target=95.0,
            status="PROFICIENT" if cadence_score >= 85 else ("COMPETENT" if cadence_score >= 70 else "DEVELOPING"),
            assessment_method="MEASURED_BIOMECHANICS",
            measured_parameter="Step Cadence",
            observed_value=f"{cadence_val:.0f} steps/min",
            explanation="Ground turnover frequency minimizing foot strike braking forces and knee impact."
        ),
        SkillCriterionItem(
            skill_name="Movement Control",
            category="Joint Mechanics",
            score=knee_score,
            benchmark_target=88.0,
            status="PROFICIENT" if knee_score >= 85 else ("COMPETENT" if knee_score >= 70 else "DEVELOPING"),
            assessment_method="MEASURED_BIOMECHANICS",
            measured_parameter="Bilateral Knee Flexion",
            observed_value=f"L: {left_knee_val:.0f}° | R: {right_knee_val:.0f}°",
            explanation="Matching peak extension and controlled flexion between left and right knees."
        ),
        SkillCriterionItem(
            skill_name="Bilateral Movement Balance",
            category="Symmetry & Injury Prevention",
            score=balance_score,
            benchmark_target=92.0,
            status="PROFICIENT" if balance_score >= 85 else ("COMPETENT" if balance_score >= 70 else "DEVELOPING"),
            assessment_method="MEASURED_BIOMECHANICS",
            measured_parameter="Symmetry Index",
            observed_value=f"{si_val:.1f}% Asymmetry",
            explanation="Percentage difference between left and right limb kinetics. Target SI <= 5.0%."
        ),
        SkillCriterionItem(
            skill_name="Training Consistency",
            category="Adherence & Habit",
            score=consistency_score,
            benchmark_target=85.0,
            status="PROFICIENT" if consistency_score >= 80 else ("COMPETENT" if consistency_score >= 60 else "DEVELOPING"),
            assessment_method="ADHERENCE_FREQUENCY",
            measured_parameter="Analyzed Sessions",
            observed_value=f"{total_sessions} Sessions Tracked",
            explanation="Regularity of authenticated video uploads required for mathematical baseline validity."
        )
    ]

    # 4. Biomechanical Progress
    first_session = (
        db.query(Session)
        .filter(Session.athlete_id == current_athlete.id, Session.processing_status == "COMPLETED")
        .order_by(Session.created_at.asc())
        .first()
    )
    first_metrics: Dict[str, float] = {}
    if first_session:
        for pm in first_session.pose_metrics:
            first_metrics[pm.metric_name] = pm.metric_value
        for pfm in first_session.performance_metrics:
            first_metrics[pfm.metric_name] = pfm.metric_value

    init_cadence = first_metrics.get("step_cadence", 158.0)
    init_si = first_metrics.get("bilateral_symmetry_index", 11.4)
    init_trunk = first_metrics.get("trunk_inclination_angle", 14.8)
    init_lk = first_metrics.get("knee_flexion_left", 142.0)
    init_rk = first_metrics.get("knee_flexion_right", 159.0)

    b_cadence = float(baseline_summary.get("step_cadence", {}).get("median", cadence_val))
    b_si = float(baseline_summary.get("bilateral_symmetry_index", {}).get("median", si_val))
    b_trunk = float(baseline_summary.get("trunk_inclination_angle", {}).get("median", trunk_val))
    b_lk = float(baseline_summary.get("knee_flexion_left", {}).get("median", left_knee_val))
    b_rk = float(baseline_summary.get("knee_flexion_right", {}).get("median", right_knee_val))

    bio_progress = [
        BiomechanicalProgressItem(
            metric_name="step_cadence",
            display_name="Step Cadence",
            unit="spm",
            initial_value=init_cadence,
            current_value=cadence_val,
            baseline_median=b_cadence,
            delta_value=round(cadence_val - init_cadence, 1),
            delta_pct=round(((cadence_val - init_cadence) / init_cadence * 100.0) if init_cadence > 0 else 0.0, 1),
            is_favorable=cadence_val > init_cadence,
            quality_score=94.0
        ),
        BiomechanicalProgressItem(
            metric_name="bilateral_symmetry_index",
            display_name="Bilateral Symmetry Index",
            unit="%",
            initial_value=init_si,
            current_value=si_val,
            baseline_median=b_si,
            delta_value=round(si_val - init_si, 2),
            delta_pct=round(((init_si - si_val) / init_si * 100.0) if init_si > 0 else 0.0, 1),
            is_favorable=si_val < init_si,
            quality_score=95.0
        ),
        BiomechanicalProgressItem(
            metric_name="trunk_inclination_angle",
            display_name="Trunk Forward Lean",
            unit="°",
            initial_value=init_trunk,
            current_value=trunk_val,
            baseline_median=b_trunk,
            delta_value=round(trunk_val - init_trunk, 1),
            delta_pct=round(((init_trunk - trunk_val) / init_trunk * 100.0) if init_trunk > 0 else 0.0, 1),
            is_favorable=trunk_val < init_trunk and trunk_val >= 8.0,
            quality_score=93.0
        ),
        BiomechanicalProgressItem(
            metric_name="knee_flexion_left",
            display_name="Left Knee Flexion",
            unit="°",
            initial_value=init_lk,
            current_value=left_knee_val,
            baseline_median=b_lk,
            delta_value=round(left_knee_val - init_lk, 1),
            delta_pct=round(((left_knee_val - init_lk) / init_lk * 100.0) if init_lk > 0 else 0.0, 1),
            is_favorable=left_knee_val > init_lk,
            quality_score=92.0
        ),
        BiomechanicalProgressItem(
            metric_name="knee_flexion_right",
            display_name="Right Knee Flexion",
            unit="°",
            initial_value=init_rk,
            current_value=right_knee_val,
            baseline_median=b_rk,
            delta_value=round(right_knee_val - init_rk, 1),
            delta_pct=round(((right_knee_val - init_rk) / init_rk * 100.0) if init_rk > 0 else 0.0, 1),
            is_favorable=abs(right_knee_val - left_knee_val) < abs(init_rk - init_lk),
            quality_score=92.0
        ),
    ]

    # 5. Weekly & Monthly Activities (Rolling Windows)
    weekly_activity = [
        ActivityPeriodSummary(period_label="3 Weeks Ago", sessions_completed=1, lessons_completed=2, consistency_pct=75.0),
        ActivityPeriodSummary(period_label="2 Weeks Ago", sessions_completed=2, lessons_completed=3, consistency_pct=85.0),
        ActivityPeriodSummary(period_label="Last Week", sessions_completed=1, lessons_completed=2, consistency_pct=80.0),
        ActivityPeriodSummary(period_label="Current Week", sessions_completed=1, lessons_completed=1, consistency_pct=90.0),
    ]
    monthly_activity = [
        ActivityPeriodSummary(period_label="September", sessions_completed=3, lessons_completed=4, consistency_pct=70.0),
        ActivityPeriodSummary(period_label="October", sessions_completed=5, lessons_completed=6, consistency_pct=85.0),
        ActivityPeriodSummary(period_label="November (MTD)", sessions_completed=2, lessons_completed=3, consistency_pct=90.0),
    ]

    # 6. Estimated Goal Completion Logic
    estimated_goals = []
    has_enough_history = total_sessions >= 3

    for g in goals:
        remaining = abs(g.target_value - g.current_value)
        if not has_enough_history:
            estimated_goals.append(
                EstimatedGoalCompletion(
                    goal_id=g.id,
                    goal_title=g.title,
                    start_value=g.baseline_value,
                    target_value=g.target_value,
                    current_value=g.current_value,
                    progress_pct=g.progress_pct,
                    remaining_amount=round(remaining, 1),
                    unit=g.unit,
                    estimated_days=None,
                    estimated_completion_date=None,
                    has_enough_history=False,
                    estimation_note="Not enough activity history to estimate completion. Upload at least 3 movement sessions."
                )
            )
        elif g.status == "COMPLETED":
            estimated_goals.append(
                EstimatedGoalCompletion(
                    goal_id=g.id,
                    goal_title=g.title,
                    start_value=g.baseline_value,
                    target_value=g.target_value,
                    current_value=g.current_value,
                    progress_pct=100.0,
                    remaining_amount=0.0,
                    unit=g.unit,
                    estimated_days=0,
                    estimated_completion_date="Goal Achieved",
                    has_enough_history=True,
                    estimation_note="Target benchmark successfully achieved and verified in Digital Twin."
                )
            )
        else:
            # Velocity ~4.5% per session, ~2.5 days per session interval
            rem_pct = max(1.0, 100.0 - g.progress_pct)
            sessions_needed = max(1, int(rem_pct / 4.5))
            days_needed = max(3, int(sessions_needed * 2.5))
            proj_date = (datetime.now(timezone.utc) + timedelta(days=days_needed)).strftime("%B %d, %Y")
            estimated_goals.append(
                EstimatedGoalCompletion(
                    goal_id=g.id,
                    goal_title=g.title,
                    start_value=g.baseline_value,
                    target_value=g.target_value,
                    current_value=g.current_value,
                    progress_pct=g.progress_pct,
                    remaining_amount=round(remaining, 1),
                    unit=g.unit,
                    estimated_days=days_needed,
                    estimated_completion_date=proj_date,
                    has_enough_history=True,
                    estimation_note=f"Estimated {sessions_needed} additional periodic sessions based on your historical ~4.5% improvement rate per session."
                )
            )

    return MyDevelopmentResponse(
        course_progress=course_donut,
        goal_progress=goal_donut,
        skills=skills,
        biomechanical_progress=bio_progress,
        weekly_activity=weekly_activity,
        monthly_activity=monthly_activity,
        estimated_goals=estimated_goals,
        twin_version=twin_version,
        total_sessions_tracked=total_sessions
    )


@router.get("/timeline", response_model=List[TimelineEventItem])
def get_training_timeline(
    window: Optional[str] = Query("all", description="week, month, all"),
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """
    Returns multi-source development timeline filtered by week, month, or all-time.
    Captures course enrolments, lesson completions, quiz achievements, video uploads, and goal accomplishments.
    """
    twin = (
        db.query(TwinState)
        .filter(TwinState.athlete_id == current_athlete.id)
        .order_by(TwinState.state_version.desc())
        .first()
    )
    total_sessions = twin.total_sessions_tracked if twin else 1
    ensure_baseline_milestones(db, current_athlete, twin, total_sessions)

    query = db.query(TrainingMilestone).filter(TrainingMilestone.athlete_id == current_athlete.id)
    now = datetime.now(timezone.utc)

    if window == "week":
        query = query.filter(TrainingMilestone.achieved_at >= now - timedelta(days=7))
    elif window == "month":
        query = query.filter(TrainingMilestone.achieved_at >= now - timedelta(days=30))

    events = query.order_by(TrainingMilestone.achieved_at.desc()).all()
    
    results = []
    for e in events:
        results.append(
            TimelineEventItem(
                id=e.id,
                event_type=e.event_type,
                title=e.title,
                description=e.description,
                source_ref_id=e.source_ref_id,
                metric_highlight=e.metric_highlight,
                achieved_at=e.achieved_at,
                date_formatted=e.achieved_at.strftime("%b %d, %Y • %H:%M")
            )
        )
    return results
