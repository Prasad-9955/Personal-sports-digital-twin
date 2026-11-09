// TypeScript Interfaces matching Backend Pydantic Schemas

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Athlete {
  id: string;
  user_id: string;
  display_name: string;
  sport: string;
  experience_level: string;
  height_cm?: number | null;
  weight_kg?: number | null;
  created_at: string;
  updated_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: User;
  athlete_id: string;
  display_name: string;
}

export interface PoseMetricItem {
  id: string;
  metric_name: string;
  metric_value: number;
  unit: string;
  confidence: number;
  frame_count: number;
  metadata_json?: Record<string, any> | null;
}

export interface PerformanceMetricItem {
  id: string;
  metric_name: string;
  metric_value: number;
  unit: string;
  measurement_method: string;
  quality_score: number;
}

export interface SessionItem {
  id: string;
  athlete_id: string;
  recorded_at: string;
  video_filename: string;
  duration_sec?: number | null;
  fps?: number | null;
  resolution?: string | null;
  processing_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'FAILED';
  quality_score?: number | null;
  error_message?: string | null;
  is_demo_data: boolean;
  created_at: string;
  completed_at?: string | null;
}

export interface SessionDetailItem extends SessionItem {
  pose_metrics: PoseMetricItem[];
  performance_metrics: PerformanceMetricItem[];
}

export interface TwinState {
  id: string;
  athlete_id: string;
  state_version: number;
  current_metrics: Record<string, any>;
  baseline_summary: Record<string, any>;
  trend_summary: Record<string, any>;
  deviation_summary: Record<string, any>;
  data_quality_index: number;
  total_sessions_tracked: number;
  status_summary: string;
  created_at: string;
}

export interface TwinOverview {
  athlete_id: string;
  display_name: string;
  sport: string;
  experience_level: string;
  active_state?: TwinState | null;
  has_baseline: boolean;
  baseline_status_message: string;
  total_sessions: number;
}

export interface BaselineItem {
  id: string;
  athlete_id: string;
  metric_name: string;
  baseline_value: number;
  baseline_mean: number;
  baseline_median: number;
  dispersion_std: number;
  dispersion_iqr: number;
  method: string;
  sample_count: number;
  confidence_level: 'INSUFFICIENT' | 'LOW' | 'MODERATE' | 'HIGH';
  calculated_at: string;
}

export interface TrendItem {
  id: string;
  athlete_id: string;
  metric_name: string;
  trend_label: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'INSUFFICIENT_DATA';
  slope: number;
  r_squared?: number | null;
  observation_count: number;
  confidence_metadata?: Record<string, any> | null;
  calculated_at: string;
}

export interface AnomalyItem {
  id: string;
  session_id: string;
  athlete_id: string;
  metric_name: string;
  observed_value: number;
  expected_value: number;
  deviation_score: number;
  severity: 'ELEVATED' | 'MODERATE' | 'MILD';
  method: string;
  explanation: string;
  created_at: string;
}

export interface MetricHistoryPoint {
  session_id: string;
  recorded_at: string;
  metric_value: number;
  confidence: number;
  baseline_value?: number | null;
  baseline_lower?: number | null;
  baseline_upper?: number | null;
  is_anomaly: boolean;
}

export interface MetricHistoryResponse {
  metric_name: string;
  unit: string;
  points: MetricHistoryPoint[];
}

export interface RecommendationItem {
  id: string;
  athlete_id: string;
  session_id?: string | null;
  recommendation_text: string;
  supporting_metrics: Record<string, any>;
  rationale: string;
  is_fallback: boolean;
  created_at: string;
}

export interface InsightItem {
  id: string;
  athlete_id: string;
  session_id?: string | null;
  insight_type: string;
  structured_facts: Record<string, any>;
  generated_text: string;
  is_fallback: boolean;
  created_at: string;
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED';
  database_connected: boolean;
  environment: string;
  gemini_api_configured: boolean;
}

export interface TrainingGoalItem {
  id: string;
  athlete_id: string;
  title: string;
  category: string;
  metric_name: string;
  target_direction: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
  baseline_value: number;
  target_value: number;
  current_value: number;
  unit: string;
  target_date?: string | null;
  progress_pct: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  created_at: string;
  completed_at?: string | null;
}

export interface TrainingGoalCreate {
  title: string;
  category?: string;
  metric_name: string;
  target_direction?: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
  baseline_value: number;
  target_value: number;
  current_value?: number;
  unit: string;
  target_date?: string | null;
}

export interface SkillScoreItem {
  skill_name: string;
  category: string;
  current_score: number;
  benchmark_target: number;
  status: 'DEVELOPING' | 'COMPETENT' | 'PROFICIENT' | 'MASTERY';
  criteria_explanation: string;
  measured_parameter: string;
  observed_value: string;
}

export interface MilestoneEventItem {
  day_label: string;
  title: string;
  description: string;
  date_str: string;
  achieved: boolean;
  session_id?: string | null;
  metric_highlight?: string | null;
}

export interface BiomechanicalImprovementItem {
  metric_name: string;
  display_name: string;
  unit: string;
  initial_value: number;
  current_value: number;
  delta_value: number;
  delta_pct: number;
  is_favorable: boolean;
  scientific_significance: string;
}

export interface ProgressSummaryResponse {
  // Category 1: Training Completion
  total_goals: number;
  completed_goals: number;
  in_progress_goals: number;
  not_started_goals: number;
  overall_goal_completion_pct: number;

  // Category 2: Skill Development
  overall_skill_development_pct: number;
  skills: SkillScoreItem[];

  // Category 3: Biomechanical Improvement
  biomechanical_improvements: BiomechanicalImprovementItem[];
  mean_improvement_pct: number;

  // Category 4: Training Consistency
  completed_sessions_count: number;
  planned_sessions_count: number;
  training_consistency_pct: number;
  weekly_frequency_avg: number;
  current_streak_days: number;

  // Category 5: Estimated Time to Completion
  estimated_days_to_goals?: number | null;
  projected_completion_date?: string | null;
  estimation_confidence: string;
  estimation_note: string;

  // Category 6: Longitudinal Milestones
  milestones: MilestoneEventItem[];
}

// ==========================================
// FEATURE 1: Training Lab & Sample Video Types
// ==========================================
export interface SampleDatasetItem {
  id: string;
  name: string;
  provider: string;
  description: string;
  source_url?: string | null;
  licence_type: string;
  licence_url?: string | null;
  created_at: string;
}

export interface SampleVideoItem {
  id: string;
  dataset_id?: string | null;
  dataset?: SampleDatasetItem | null;
  title: string;
  category: 'beginner_running' | 'normal_running' | 'fast_running' | 'walking_gait' | 'camera_angles';
  description: string;
  difficulty_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration_sec: number;
  camera_angle: 'sagittal_lateral' | 'frontal_anterior' | 'posterior' | 'oblique';
  video_filename: string;
  video_url: string;
  thumbnail_url?: string | null;
  fps?: number | null;
  resolution?: string | null;
  benchmark_metrics?: Record<string, any> | null;
  is_active: boolean;
  created_at: string;
}

export interface SampleAnalysisResponse {
  id: string;
  sample_video_id: string;
  sample_video_title: string;
  category: string;
  camera_angle: string;
  quality_score: number;
  metrics_summary: Record<string, any>;
  is_demo_data: boolean;
  demonstration_notice: string;
  created_at: string;
}

// ==========================================
// FEATURE 2: Training Academy Types
// ==========================================
export interface LessonProgressItem {
  lesson_id: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  quiz_score?: number | null;
  completed_at?: string | null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface CourseLessonItem {
  id: string;
  module_id: string;
  title: string;
  lesson_type: 'VIDEO' | 'TEXT' | 'DEMO' | 'PRACTICAL' | 'QUIZ' | 'ASSIGNMENT';
  content_text?: string | null;
  video_url?: string | null;
  duration_min: number;
  quiz_data?: QuizQuestion[] | null;
  assignment_instructions?: string | null;
  order_index: number;
  user_progress?: LessonProgressItem | null;
}

export interface CourseModuleItem {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  order_index: number;
  lessons: CourseLessonItem[];
  completed_lessons_count: number;
  total_lessons_count: number;
}

export interface CourseEnrollmentItem {
  id: string;
  course_id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  progress_pct: number;
  enrolled_at: string;
  last_accessed_at: string;
  completed_at?: string | null;
}

export interface CourseListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimated_duration_min: number;
  thumbnail_url?: string | null;
  modules_count: number;
  lessons_count: number;
  is_enrolled: boolean;
  progress_pct: number;
}

export interface CourseDetailItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimated_duration_min: number;
  thumbnail_url?: string | null;
  modules: CourseModuleItem[];
  is_enrolled: boolean;
  progress_pct: number;
  enrollment?: CourseEnrollmentItem | null;
}

// ==========================================
// FEATURE 3 & 4: My Development & Timeline Types
// ==========================================
export interface CourseProgressDonutData {
  completed_lessons: number;
  in_progress_lessons: number;
  not_started_lessons: number;
  total_lessons: number;
  overall_course_completion_pct: number;
}

export interface TrainingGoalDonutData {
  completed_goals: number;
  in_progress_goals: number;
  not_started_goals: number;
  total_goals: number;
  overall_goal_completion_pct: number;
}

export interface SkillCriterionData {
  skill_name: string;
  category: string;
  score: number;
  benchmark_target: number;
  status: 'DEVELOPING' | 'COMPETENT' | 'PROFICIENT' | 'MASTERY';
  assessment_method: 'MEASURED_BIOMECHANICS' | 'QUIZ_EVALUATION' | 'ADHERENCE_FREQUENCY';
  measured_parameter: string;
  observed_value: string;
  explanation: string;
}

export interface BiomechanicalProgressData {
  metric_name: string;
  display_name: string;
  unit: string;
  initial_value: number;
  current_value: number;
  baseline_median: number;
  delta_value: number;
  delta_pct: number;
  is_favorable: boolean;
  quality_score: number;
}

export interface ActivityPeriodData {
  period_label: string;
  sessions_completed: number;
  lessons_completed: number;
  consistency_pct: number;
}

export interface EstimatedGoalData {
  goal_id: string;
  goal_title: string;
  start_value: number;
  target_value: number;
  current_value: number;
  progress_pct: number;
  remaining_amount: number;
  unit: string;
  estimated_days?: number | null;
  estimated_completion_date?: string | null;
  has_enough_history: boolean;
  estimation_note: string;
}

export interface TimelineEventData {
  id: string;
  event_type: string;
  title: string;
  description: string;
  source_ref_id?: string | null;
  metric_highlight?: string | null;
  achieved_at: string;
  date_formatted: string;
}

export interface MyDevelopmentData {
  course_progress: CourseProgressDonutData;
  goal_progress: TrainingGoalDonutData;
  skills: SkillCriterionData[];
  biomechanical_progress: BiomechanicalProgressData[];
  weekly_activity: ActivityPeriodData[];
  monthly_activity: ActivityPeriodData[];
  estimated_goals: EstimatedGoalData[];
  twin_version: number;
  total_sessions_tracked: number;
}
