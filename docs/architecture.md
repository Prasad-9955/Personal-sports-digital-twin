# System Architecture — Personal Sports Digital Twin

## 1. High-Level Vision
The **Personal Sports Digital Twin** is an evolving, history-aware software representation of an athlete across repeated training sessions. Unlike snapshot video tools that merely observe isolated frames, this platform builds an athlete's longitudinal trajectory, determines personal baseline distributions, detects subtle mechanical deviations, and maintains an auditable history of the athlete's evolving functional state.

```
+-------------------------------------------------------------------------+
|                           Mobile Client (Flutter)                       |
|   Dashboard | Session History | Trend Visualizations | Twin State View  |
+-------------------------------------------------------------------------+
                                    |  HTTP / REST (JSON + multipart)
                                    v
+-------------------------------------------------------------------------+
|                        FastAPI Authoritative Backend                    |
|  - Auth & Ownership Middleware (JWT + Bcrypt)                           |
|  - Upload & Format Validation (MIME, Duration, Resolution Guardrails)   |
|  - Processing Orchestrator & Transaction Management                     |
+-------------------------------------------------------------------------+
         |                                           |
         v                                           v
+-----------------------------+             +-----------------------------+
|    Computer Vision Engine   |             |    Analytics & Twin Engine  |
| - OpenCV Video Frame Probe  |             | - Rolling Baseline Analysis |
| - MediaPipe BlazePose (33)  |             | - Trend Direction & Slopes  |
| - Landmark Quality Filter   |             | - Statistical Deviations    |
| - Biomechanical Kinematics  |             | - Scikit-Learn (IsoForest)  |
+-----------------------------+             | - Deterministic Twin Update |
                                            +-----------------------------+
                                                     |
                                                     v
                                            +-----------------------------+
                                            |   Grounded AI Readback      |
                                            | - Google Gemini SDK         |
                                            | - Evidence Fact Grounding   |
                                            | - Deterministic Fallback    |
                                            +-----------------------------+
                                                     |
                                                     v
+-------------------------------------------------------------------------+
|                    PostgreSQL Relational Persistence                    |
| Users | Athletes | Sessions | PoseMetrics | Baselines | TwinStates ...  |
+-------------------------------------------------------------------------+
```

## 2. Core Modules & Responsibilities

### Presentation Layer (Flutter)
- Authenticated state with secure token storage.
- Interactive multi-session time series charts with personal baseline bands using `fl_chart`.
- Digital Twin status card with confidence ratings, quality indicators, and deviation flags.
- Real-time video upload progress and graceful error handling.

### Authoritative API (FastAPI)
- Enforces user authentication and strict athlete ownership (no athlete can access or mutate another athlete's data).
- Validates uploaded video formats, codecs, and durations before queueing analysis.
- Exposes versioned endpoints with Pydantic v2 schemas and deterministic error contracts.

### Biomechanical Observation Layer (OpenCV + MediaPipe BlazePose)
- Ingests raw video frames safely and extracts 33 standard body landmarks.
- Computes per-frame visibility scores; rejects or flags frames where key joints are occluded or low confidence ($< 0.70$).
- Calculates joint kinematics (knee flexion, sagittal trunk inclination, bilateral symmetry index, and cadence).
- Aggregates per-frame time-series into session summary statistics (mean, min, max, standard deviation).

### Digital Twin & Longitudinal Engine
- Maintains versioned snapshots in PostgreSQL table `twin_states`.
- Evaluates personal baselines using robust statistics (median and IQR for $N \ge 3$; mean and standard deviation for $N \ge 5$).
- Calculates metric trend directions (`IMPROVING`, `STABLE`, `DECLINING`) based on sport-specific polarity.
- Identifies anomalies using modified $z$-scores and scikit-learn's `IsolationForest` when sample size $N \ge 10$.
- Prevents duplicate state transitions through database transactions and idempotent session handling.

### Grounded AI Explanation (Gemini API + Fallback)
- Accepts strictly structured analytical facts (metric values, baselines, trends, deviations, quality scores).
- Generates natural, athletic coaching explanations without computing or hallucinating underlying numbers.
- Employs a deterministic rule-based template engine as an immediate fallback if Gemini API is unavailable or offline.
