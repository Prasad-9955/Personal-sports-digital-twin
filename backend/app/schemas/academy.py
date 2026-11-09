import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class LessonProgressResponse(BaseModel):
    lesson_id: uuid.UUID
    status: str
    quiz_score: Optional[float] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CourseLessonResponse(BaseModel):
    id: uuid.UUID
    module_id: uuid.UUID
    title: str
    lesson_type: str
    content_text: Optional[str] = None
    video_url: Optional[str] = None
    duration_min: int
    quiz_data: Optional[List[Dict[str, Any]]] = None
    assignment_instructions: Optional[str] = None
    order_index: int
    user_progress: Optional[LessonProgressResponse] = None

    model_config = ConfigDict(from_attributes=True)

class CourseModuleResponse(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    title: str
    description: Optional[str] = None
    order_index: int
    lessons: List[CourseLessonResponse] = []
    completed_lessons_count: int = 0
    total_lessons_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class CourseEnrollmentResponse(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    status: str
    progress_pct: float
    enrolled_at: datetime
    last_accessed_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CourseListResponse(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    description: str
    level: str
    estimated_duration_min: int
    thumbnail_url: Optional[str] = None
    modules_count: int = 0
    lessons_count: int = 0
    is_enrolled: bool = False
    progress_pct: float = 0.0

    model_config = ConfigDict(from_attributes=True)

class CourseDetailResponse(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    description: str
    level: str
    estimated_duration_min: int
    thumbnail_url: Optional[str] = None
    modules: List[CourseModuleResponse] = []
    is_enrolled: bool = False
    progress_pct: float = 0.0
    enrollment: Optional[CourseEnrollmentResponse] = None

    model_config = ConfigDict(from_attributes=True)

class LessonProgressUpdate(BaseModel):
    status: str = Field(default="COMPLETED")  # IN_PROGRESS or COMPLETED
    quiz_answers: Optional[List[int]] = None  # User's submitted option indices
