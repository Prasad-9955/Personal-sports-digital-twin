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
