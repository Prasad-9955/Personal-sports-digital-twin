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
