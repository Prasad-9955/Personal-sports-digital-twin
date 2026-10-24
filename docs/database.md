# Database Architecture & Schema — Personal Sports Digital Twin

## 1. Overview
The database layer is built on PostgreSQL with SQLAlchemy 2.0 ORM and Alembic migrations. It serves as the longitudinal, immutable-auditable memory of the athlete's Digital Twin.

All primary keys use UUIDs (`uuid.uuid4`) to prevent ID enumeration attacks. Foreign keys enforce strict cascade deletion rules where appropriate.

## 2. Table Specifications & Relationships

### `users`
- `id`: `UUID` (PK)
- `email`: `VARCHAR(255)` (Unique, Indexed, Non-null)
- `password_hash`: `VARCHAR(255)` (Non-null, bcrypt hashed)
- `created_at`: `TIMESTAMP WITH TIME ZONE` (Default UTC now)
- `updated_at`: `TIMESTAMP WITH TIME ZONE` (Default UTC now, auto-updated)
- *Relationship*: `1:1` with `athletes` (Cascade delete).

### `athletes`
- `id`: `UUID` (PK)
- `user_id`: `UUID` (FK -> `users.id`, Unique, Indexed, On Delete CASCADE)
- `display_name`: `VARCHAR(100)` (Non-null)
- `sport`: `VARCHAR(50)` (Default: 'running')
- `experience_level`: `VARCHAR(50)` ('beginner', 'intermediate', 'advanced', 'elite')
- `height_cm`: `FLOAT` (Nullable, physical reference)
- `weight_kg`: `FLOAT` (Nullable, physical reference)
- `created_at`: `TIMESTAMP WITH TIME ZONE` (Default UTC now)
- `updated_at`: `TIMESTAMP WITH TIME ZONE` (Default UTC now)
- *Relationships*:
  - `1:N` with `sessions`
  - `1:N` with `personal_baselines`
  - `1:N` with `trend_results`
  - `1:N` with `twin_states`

### `sessions`
- `id`: `UUID` (PK)
- `athlete_id`: `UUID` (FK -> `athletes.id`, Indexed, On Delete CASCADE)
- `recorded_at`: `TIMESTAMP WITH TIME ZONE` (Default UTC now)
- `video_filename`: `VARCHAR(255)` (Non-null safe hash)
- `video_path`: `VARCHAR(512)` (Non-null server storage path)
- `duration_sec`: `FLOAT` (Validated video duration)
- `fps`: `FLOAT` (Validated video frame rate)
- `resolution`: `VARCHAR(50)` (e.g. '1920x1080')
- `processing_status`: `VARCHAR(30)` ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED')
- `quality_score`: `FLOAT` (0.0 to 100.0)
- `error_message`: `TEXT` (Nullable, safe client-facing explanation)
- `is_demo_data`: `BOOLEAN` (Default FALSE; TRUE for simulated sessions)
- `created_at`: `TIMESTAMP WITH TIME ZONE`
- `completed_at`: `TIMESTAMP WITH TIME ZONE`
- *Relationships*:
  - `1:N` with `pose_metrics`
  - `1:N` with `performance_metrics`
  - `1:N` with `anomaly_results`
  - `1:N` with `insights`
  - `1:N` with `recommendations`

### `pose_metrics`
- `id`: `UUID` (PK)
- `session_id`: `UUID` (FK -> `sessions.id`, Indexed, On Delete CASCADE)
- `metric_name`: `VARCHAR(100)` (e.g. 'trunk_inclination_angle', 'knee_flexion_left', 'knee_flexion_right', 'bilateral_symmetry_index')
- `metric_value`: `FLOAT` (Non-null)
- `unit`: `VARCHAR(30)` ('degrees', 'percent', 'steps/min')
- `confidence`: `FLOAT` (0.0 to 1.0 landmark visibility score)
- `frame_count`: `INTEGER` (Number of valid evaluated frames)
- `metadata_json`: `JSONB` (Stores min, max, std, and per-frame percentiles)

### `performance_metrics`
- `id`: `UUID` (PK)
- `session_id`: `UUID` (FK -> `sessions.id`, Indexed, On Delete CASCADE)
- `metric_name`: `VARCHAR(100)` (e.g. 'step_cadence', 'contact_phase_ratio')
- `metric_value`: `FLOAT` (Non-null)
- `unit`: `VARCHAR(30)`
- `measurement_method`: `VARCHAR(100)` ('zero_crossing_frequency', 'peak_prominence')
- `quality_score`: `FLOAT`

### `personal_baselines`
- `id`: `UUID` (PK)
- `athlete_id`: `UUID` (FK -> `athletes.id`, Indexed, On Delete CASCADE)
- `metric_name`: `VARCHAR(100)`
- `baseline_mean`: `FLOAT`
- `baseline_median`: `FLOAT`
- `dispersion_std`: `FLOAT`
- `dispersion_iqr`: `FLOAT`
- `sample_count`: `INTEGER` (Number of historical sessions used)
- `confidence_level`: `VARCHAR(20)` ('INSUFFICIENT', 'LOW', 'MODERATE', 'HIGH')
- `calculated_at`: `TIMESTAMP WITH TIME ZONE`

### `trend_results`
- `id`: `UUID` (PK)
- `athlete_id`: `UUID` (FK -> `athletes.id`, Indexed, On Delete CASCADE)
- `metric_name`: `VARCHAR(100)`
- `trend_direction`: `VARCHAR(30)` ('IMPROVING', 'STABLE', 'DECLINING', 'INSUFFICIENT_DATA')
- `slope`: `FLOAT` (Units per session / day)
- `p_value`: `FLOAT` (Statistical significance)
- `observation_count`: `INTEGER`
- `calculated_at`: `TIMESTAMP WITH TIME ZONE`

### `anomaly_results`
- `id`: `UUID` (PK)
- `session_id`: `UUID` (FK -> `sessions.id`, Indexed, On Delete CASCADE)
- `athlete_id`: `UUID` (FK -> `athletes.id`, Indexed, On Delete CASCADE)
- `metric_name`: `VARCHAR(100)`
- `observed_value`: `FLOAT`
- `expected_value`: `FLOAT`
- `deviation_score`: `FLOAT` (Modified z-score or Isolation Forest anomaly score)
- `severity`: `VARCHAR(20)` ('INFO', 'MILD', 'ELEVATED')
- `explanation`: `TEXT`
- `created_at`: `TIMESTAMP WITH TIME ZONE`

### `twin_states`
- `id`: `UUID` (PK)
- `athlete_id`: `UUID` (FK -> `athletes.id`, Indexed, On Delete CASCADE)
- `state_version`: `INTEGER` (Strict monotonically increasing per athlete)
- `current_metrics_json`: `JSONB` (Latest valid session metrics)
- `baseline_summary_json`: `JSONB` (Active baseline metrics & confidence)
- `trend_summary_json`: `JSONB` (Active trends & directions)
- `deviation_summary_json`: `JSONB` (Recent anomalies)
- `data_quality_index`: `FLOAT` (Longitudinal tracking quality 0–100%)
- `created_at`: `TIMESTAMP WITH TIME ZONE` (Snapshot timestamp)

### `insights` & `recommendations`
- `id`: `UUID` (PK)
- `athlete_id`: `UUID` (FK -> `athletes.id`, Indexed)
- `session_id`: `UUID` (FK -> `sessions.id`, Indexed)
- `insight_type` / `recommendation_text`: `TEXT`
- `structured_facts_json`: `JSONB` (Evidence payload supplied to explainer)
- `is_fallback`: `BOOLEAN` (True if generated by rule fallback engine)
- `rationale`: `TEXT` (Biomechanical justification)
- `created_at`: `TIMESTAMP WITH TIME ZONE`

## 3. Data Retention & Privacy Policy
1. Video files are stored in a secured directory outside PostgreSQL and referenced solely by UUID and hash.
2. Video deletion does not destroy derived metrics or baseline history.
3. Plaintext passwords or API tokens are strictly excluded from all tables and logs.
