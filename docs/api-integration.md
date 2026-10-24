# API Integration Reference — Web Client

This document lists the REST API integration contracts between the React web client (`web/src/api/client.ts`) and the FastAPI authoritative backend (`backend/app/main.py`).

---

## 1. Authentication & Athlete Profile

### Register Athlete
- **Endpoint**: `POST /api/v1/auth/register`
- **Request Body**:
  ```json
  {
    "email": "athlete@example.com",
    "password": "secretpassword",
    "display_name": "Alex Morgan",
    "sport": "running",
    "experience_level": "intermediate",
    "height_cm": 178.0,
    "weight_kg": 70.0
  }
  ```
- **Response**: `201 Created` with JWT `access_token` and athlete details.

### Login Athlete
- **Endpoint**: `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "athlete@example.com",
    "password": "secretpassword"
  }
  ```
- **Response**: `200 OK` with JWT `access_token`.

### Get Current Athlete
- **Endpoint**: `GET /api/v1/athletes/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `AthleteResponse`

### Update Athlete Profile
- **Endpoint**: `PUT /api/v1/athletes/me`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Partial fields (`display_name`, `sport`, `experience_level`, `height_cm`, `weight_kg`).

---

## 2. Sessions & Video Processing

### Upload Movement Video
- **Endpoint**: `POST /api/v1/sessions/upload`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body**: `file: <binary_video_data>`
- **Response**: `SessionResponse` with status `"PENDING"`.

### Process Session (Run MediaPipe & Baselines)
- **Endpoint**: `POST /api/v1/sessions/{session_id}/process`
- **Headers**: `Authorization: Bearer <token>`
- **Process**:
  1. MediaPipe BlazePose extracts 33 landmarks.
  2. Kinematic feature calculations (trunk inclination, knee flexion, bilateral symmetry, cadence).
  3. Updates rolling personal baselines ($N \ge 3$).
  4. Computes metric trends and modified $z$-score deviations.
  5. Produces immutable `TwinState` snapshot (`v1`, `v2`, ...).
  6. Generates Gemini AI coaching explanation.
- **Response**: `SessionDetailResponse` with status `"COMPLETED"`.

### List Sessions
- **Endpoint**: `GET /api/v1/sessions?limit=50&offset=0`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `List[SessionResponse]`

### Get Session Detail
- **Endpoint**: `GET /api/v1/sessions/{session_id}`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `SessionDetailResponse` with `pose_metrics` and `performance_metrics`.

### Video Stream
- **URL**: `GET /uploads/{video_filename}`
- **Static mount**: Served directly by FastAPI StaticFiles.

---

## 3. Digital Twin & Analytics

### Digital Twin Overview
- **Endpoint**: `GET /api/v1/twin`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `TwinOverviewResponse` with `active_state`, `has_baseline`, and `total_sessions`.

### Digital Twin State Machine History
- **Endpoint**: `GET /api/v1/twin/history`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `List[TwinStateResponse]` ordered chronologically.

### Seed 5-Session Demo Data
- **Endpoint**: `POST /api/v1/demo/seed`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `201 Created` with seeded session count and updated twin version.

### Metric Trajectory History
- **Endpoint**: `GET /api/v1/metrics/history/{metric_name}`
- **Headers**: `Authorization: Bearer <token>`
- **Supported metrics**: `trunk_angle_deg`, `knee_angle_left_deg`, `knee_angle_right_deg`, `symmetry_index_percent`, `cadence_spm`.
- **Response**: `MetricHistoryResponse` with array of observation points, baseline values, and anomaly flags.

### Metric Trends
- **Endpoint**: `GET /api/v1/trends`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `List[TrendResponse]` with trajectory slopes and trend labels (`IMPROVING`, `STABLE`, `DECLINING`).

### Detected Variations / Anomalies
- **Endpoint**: `GET /api/v1/anomalies`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `List[AnomalyResponse]` with observed vs expected values, deviation scores, and severity ratings.

### AI Recommendations & Insights
- **Endpoint**: `GET /api/v1/recommendations` & `GET /api/v1/insights`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `List[RecommendationResponse]` (drill prescriptions) and `List[InsightItem]` (editorial summary).
