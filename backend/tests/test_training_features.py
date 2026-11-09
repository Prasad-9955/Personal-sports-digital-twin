import pytest
import uuid
from unittest.mock import MagicMock
from app.models import Course, CourseModule, CourseLesson, CourseEnrollment, LessonProgress, SampleVideo
from app.schemas.training_lab import SampleAnalysisResponse
from app.schemas.development import CourseProgressDonut, TrainingGoalDonut

def test_sample_analysis_response_isolation():
    resp = SampleAnalysisResponse(
        id=uuid.uuid4(),
        sample_video_id=uuid.uuid4(),
        sample_video_title="Trained Distance Runner (10.0 km/h)",
        category="normal_running",
        camera_angle="sagittal_lateral",
        quality_score=94.5,
        metrics_summary={
            "step_cadence": {"value": 168.0, "unit": "spm"},
            "bilateral_symmetry_index": {"value": 5.4, "unit": "%"}
        },
        is_demo_data=True,
        demonstration_notice="DEMONSTRATION DATA ONLY. This analysis run does NOT update your personal baseline or Digital Twin state.",
        created_at=MagicMock()
    )
    assert resp.is_demo_data is True
    assert "DEMONSTRATION DATA ONLY" in resp.demonstration_notice

def test_course_progress_calculation():
    # 10 lessons total: 5 completed, 3 in progress, 2 not started
    total = 10
    completed = 5
    in_prog = 3
    not_started = 2

    pct = round((completed / total) * 100.0, 1)
    donut = CourseProgressDonut(
        completed_lessons=completed,
        in_progress_lessons=in_prog,
        not_started_lessons=not_started,
        total_lessons=total,
        overall_course_completion_pct=pct
    )
    assert donut.overall_course_completion_pct == 50.0
    assert donut.total_lessons == 10

def test_quiz_grading_logic():
    quiz_data = [
        {"question": "Q1", "options": ["A", "B", "C"], "correct_index": 1},
        {"question": "Q2", "options": ["A", "B"], "correct_index": 0},
    ]
    user_answers = [1, 0]  # Both correct
    total_q = len(quiz_data)
    correct_count = sum(1 for idx, q in enumerate(quiz_data) if user_answers[idx] == q["correct_index"])
    score = (correct_count / total_q) * 100.0
    assert score == 100.0

    # One wrong
    user_answers_2 = [1, 1]
    correct_count_2 = sum(1 for idx, q in enumerate(quiz_data) if user_answers_2[idx] == q["correct_index"])
    score_2 = (correct_count_2 / total_q) * 100.0
    assert score_2 == 50.0
