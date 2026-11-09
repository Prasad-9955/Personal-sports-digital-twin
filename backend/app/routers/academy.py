import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DbSession
from app.database import get_db
from app.models import (
    Athlete,
    Course,
    CourseModule,
    CourseLesson,
    CourseEnrollment,
    LessonProgress,
    TrainingMilestone
)
from app.schemas.academy import (
    CourseListResponse,
    CourseDetailResponse,
    CourseModuleResponse,
    CourseLessonResponse,
    CourseEnrollmentResponse,
    LessonProgressResponse,
    LessonProgressUpdate
)
from app.dependencies import get_current_athlete
from app.services.academy_seed_service import seed_academy_courses_and_lessons

router = APIRouter(prefix="/academy", tags=["Training Academy: Courses & Lessons"])

@router.get("/courses", response_model=List[CourseListResponse])
def list_courses(
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """
    Lists all available training academy courses with the athlete's enrollment progress.
    Auto-seeds standard curriculum if database is newly initialized.
    """
    seed_academy_courses_and_lessons(db)

    courses = db.query(Course).filter(Course.is_published == True).order_by(Course.order_index.asc()).all()
    enrollments = {
        e.course_id: e
        for e in db.query(CourseEnrollment).filter(CourseEnrollment.athlete_id == current_athlete.id).all()
    }

    results = []
    for c in courses:
        enr = enrollments.get(c.id)
        # Count total lessons across all modules
        total_lessons = sum(len(m.lessons) for m in c.modules)
        results.append(
            CourseListResponse(
                id=c.id,
                slug=c.slug,
                title=c.title,
                description=c.description,
                level=c.level,
                estimated_duration_min=c.estimated_duration_min,
                thumbnail_url=c.thumbnail_url,
                modules_count=len(c.modules),
                lessons_count=total_lessons,
                is_enrolled=bool(enr),
                progress_pct=enr.progress_pct if enr else 0.0
            )
        )
    return results


@router.get("/courses/{course_id_or_slug}", response_model=CourseDetailResponse)
def get_course_detail(
    course_id_or_slug: str,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """
    Retrieves full course curriculum breakdown (modules & lessons) with student lesson progress.
    """
    seed_academy_courses_and_lessons(db)

    # Resolve by UUID or slug
    course = None
    try:
        val_uuid = uuid.UUID(course_id_or_slug)
        course = db.query(Course).filter(Course.id == val_uuid).first()
    except ValueError:
        course = db.query(Course).filter(Course.slug == course_id_or_slug).first()

    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    enrollment = (
        db.query(CourseEnrollment)
        .filter(CourseEnrollment.athlete_id == current_athlete.id, CourseEnrollment.course_id == course.id)
        .first()
    )

    lesson_progress_map = {}
    if enrollment:
        progress_records = db.query(LessonProgress).filter(LessonProgress.enrollment_id == enrollment.id).all()
        for lp in progress_records:
            lesson_progress_map[lp.lesson_id] = LessonProgressResponse(
                lesson_id=lp.lesson_id,
                status=lp.status,
                quiz_score=lp.quiz_score,
                completed_at=lp.completed_at
            )

    modules_resp = []
    for m in course.modules:
        lessons_resp = []
        completed_in_mod = 0
        for l in m.lessons:
            prog = lesson_progress_map.get(l.id)
            if prog and prog.status == "COMPLETED":
                completed_in_mod += 1

            lessons_resp.append(
                CourseLessonResponse(
                    id=l.id,
                    module_id=l.module_id,
                    title=l.title,
                    lesson_type=l.lesson_type,
                    content_text=l.content_text,
                    video_url=l.video_url,
                    duration_min=l.duration_min,
                    quiz_data=l.quiz_data,
                    assignment_instructions=l.assignment_instructions,
                    order_index=l.order_index,
                    user_progress=prog
                )
            )

        modules_resp.append(
            CourseModuleResponse(
                id=m.id,
                course_id=m.course_id,
                title=m.title,
                description=m.description,
                order_index=m.order_index,
                lessons=lessons_resp,
                completed_lessons_count=completed_in_mod,
                total_lessons_count=len(lessons_resp)
            )
        )

    return CourseDetailResponse(
        id=course.id,
        slug=course.slug,
        title=course.title,
        description=course.description,
        level=course.level,
        estimated_duration_min=course.estimated_duration_min,
        thumbnail_url=course.thumbnail_url,
        modules=modules_resp,
        is_enrolled=bool(enrollment),
        progress_pct=enrollment.progress_pct if enrollment else 0.0,
        enrollment=CourseEnrollmentResponse.model_validate(enrollment) if enrollment else None
    )


@router.post("/courses/{course_id}/enroll", response_model=CourseEnrollmentResponse)
def enroll_in_course(
    course_id: uuid.UUID,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """Enrolls the current athlete into the designated course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    existing = (
        db.query(CourseEnrollment)
        .filter(CourseEnrollment.athlete_id == current_athlete.id, CourseEnrollment.course_id == course.id)
        .first()
    )
    if existing:
        return existing

    enrollment = CourseEnrollment(
        athlete_id=current_athlete.id,
        course_id=course.id,
        status="ACTIVE",
        progress_pct=0.0,
        enrolled_at=datetime.now(timezone.utc),
        last_accessed_at=datetime.now(timezone.utc)
    )
    db.add(enrollment)

    # Log training milestone
    milestone = TrainingMilestone(
        athlete_id=current_athlete.id,
        event_type="COURSE_ENROLLED",
        title=f"Enrolled in {course.title}",
        description=f"Initiated structured curriculum for {course.level} running biomechanics.",
        source_ref_id=str(course.id),
        metric_highlight=f"{course.estimated_duration_min} min curriculum",
        achieved_at=datetime.now(timezone.utc)
    )
    db.add(milestone)
    db.commit()
    db.refresh(enrollment)

    return enrollment


@router.get("/lessons/{lesson_id}", response_model=CourseLessonResponse)
def get_lesson_detail(
    lesson_id: uuid.UUID,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """Retrieves full lesson content and current athlete's progress."""
    lesson = db.query(CourseLesson).filter(CourseLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    # Find enrollment
    course_id = lesson.module.course_id
    enrollment = (
        db.query(CourseEnrollment)
        .filter(CourseEnrollment.athlete_id == current_athlete.id, CourseEnrollment.course_id == course_id)
        .first()
    )

    user_prog = None
    if enrollment:
        lp = db.query(LessonProgress).filter(
            LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.lesson_id == lesson.id
        ).first()
        if lp:
            user_prog = LessonProgressResponse.model_validate(lp)

    return CourseLessonResponse(
        id=lesson.id,
        module_id=lesson.module_id,
        title=lesson.title,
        lesson_type=lesson.lesson_type,
        content_text=lesson.content_text,
        video_url=lesson.video_url,
        duration_min=lesson.duration_min,
        quiz_data=lesson.quiz_data,
        assignment_instructions=lesson.assignment_instructions,
        order_index=lesson.order_index,
        user_progress=user_prog
    )


@router.post("/lessons/{lesson_id}/progress", response_model=LessonProgressResponse)
def update_lesson_progress(
    lesson_id: uuid.UUID,
    prog_in: LessonProgressUpdate,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: DbSession = Depends(get_db)
):
    """
    Updates completion progress for a lesson.
    If lesson is a QUIZ, calculates score from quiz_answers.
    Recalculates course progress percentage automatically.
    """
    lesson = db.query(CourseLesson).filter(CourseLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    course_id = lesson.module.course_id
    enrollment = (
        db.query(CourseEnrollment)
        .filter(CourseEnrollment.athlete_id == current_athlete.id, CourseEnrollment.course_id == course_id)
        .first()
    )
    if not enrollment:
        # Auto-enroll if not already
        enrollment = CourseEnrollment(
            athlete_id=current_athlete.id,
            course_id=course_id,
            status="ACTIVE",
            progress_pct=0.0
        )
        db.add(enrollment)
        db.flush()

    progress = (
        db.query(LessonProgress)
        .filter(LessonProgress.enrollment_id == enrollment.id, LessonProgress.lesson_id == lesson.id)
        .first()
    )
    if not progress:
        progress = LessonProgress(
            enrollment_id=enrollment.id,
            lesson_id=lesson.id,
            status="NOT_STARTED"
        )
        db.add(progress)

    # Score Quiz if provided
    quiz_score = None
    if lesson.lesson_type == "QUIZ" and lesson.quiz_data and prog_in.quiz_answers:
        questions = lesson.quiz_data
        total_q = len(questions)
        correct_count = 0
        for idx, q in enumerate(questions):
            correct_idx = q.get("correct_index", 0)
            user_ans = prog_in.quiz_answers[idx] if idx < len(prog_in.quiz_answers) else -1
            if user_ans == correct_idx:
                correct_count += 1
        quiz_score = round((correct_count / total_q) * 100.0, 1) if total_q > 0 else 100.0
        progress.quiz_score = quiz_score

    progress.status = prog_in.status
    if prog_in.status == "COMPLETED" and not progress.completed_at:
        progress.completed_at = datetime.now(timezone.utc)

    db.flush()

    # Recalculate Course Overall Progress
    all_course_lessons = (
        db.query(CourseLesson)
        .join(CourseModule, CourseLesson.module_id == CourseModule.id)
        .filter(CourseModule.course_id == course_id)
        .all()
    )
    total_course_lessons = len(all_course_lessons)
    completed_count = (
        db.query(LessonProgress)
        .filter(LessonProgress.enrollment_id == enrollment.id, LessonProgress.status == "COMPLETED")
        .count()
    )

    new_pct = round((completed_count / total_course_lessons * 100.0) if total_course_lessons > 0 else 0.0, 1)
    enrollment.progress_pct = new_pct
    enrollment.last_accessed_at = datetime.now(timezone.utc)

    if new_pct >= 100.0 and enrollment.status != "COMPLETED":
        enrollment.status = "COMPLETED"
        enrollment.completed_at = datetime.now(timezone.utc)

        # Award Milestone
        milestone = TrainingMilestone(
            athlete_id=current_athlete.id,
            event_type="COURSE_COMPLETED",
            title=f"Completed {lesson.module.course.title}",
            description=f"Successfully finished all {total_course_lessons} lessons and practical assignments.",
            source_ref_id=str(course_id),
            metric_highlight="100% Course Completion",
            achieved_at=datetime.now(timezone.utc)
        )
        db.add(milestone)
    elif prog_in.status == "COMPLETED":
        milestone = TrainingMilestone(
            athlete_id=current_athlete.id,
            event_type="LESSON_COMPLETED",
            title=f"Completed Lesson: {lesson.title}",
            description=f"Unit completed in {lesson.module.title}",
            source_ref_id=str(lesson.id),
            metric_highlight=f"{quiz_score}% Score" if quiz_score is not None else "Lesson Verified",
            achieved_at=datetime.now(timezone.utc)
        )
        db.add(milestone)

    db.commit()
    db.refresh(progress)

    return LessonProgressResponse.model_validate(progress)
