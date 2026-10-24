# Personal Sports Digital Twin 🏃‍♂️🧬

An academic, modular, history-aware mobile and cloud application that maintains an evolving digital representation of an athlete across repeated training sessions.

---

## 🌟 Core Differentiator: Longitudinal Digital Twin vs. Video Analyzer

A conventional video analysis tool answers:
> *"What happened in this video clip?"*

The **Personal Sports Digital Twin** answers:
> *"How is this athlete changing over time compared with their own personal history, and what movement variations should they monitor next?"*

Rather than computing transient snapshots in isolation, this system maintains a persistent, versioned software twin in PostgreSQL. Every valid new session updates the athlete's personal baseline distribution, identifies longitudinal kinematic trends, detects deviations using robust statistics ($z$-scores and scikit-learn's Isolation Forest), and presents evidence-grounded coaching insights via Google Gemini (with an autonomous deterministic fallback).

---

## 🛠️ Technology Stack

- **Mobile Client**: Flutter & Dart (Material 3 Dark Theme, `fl_chart`, `file_picker`, typed services).
- **Authoritative Backend**: Python & FastAPI (CORS, JWT authentication, Bcrypt).
- **Computer Vision**: OpenCV (video decoding, metadata validation, duration/resolution guardrails).
- **Pose Estimation**: MediaPipe BlazePose (33 full-body landmarks, per-frame visibility filtering).
- **Persistence**: PostgreSQL (UUIDs, indexed foreign keys, cascade rules).
- **ORM & Migrations**: SQLAlchemy 2.0 & Alembic.
- **Analytics & ML**: NumPy, SciPy, Pandas, scikit-learn (`IsolationForest`).
- **AI Readback**: Google Gemini API via official Python SDK (`google-genai`) with a deterministic rule-based fallback.
- **Automated Testing**: `pytest` & `httpx` (10 automated unit, integration, and E2E video tests).

---

## 📐 Supported Sport & Biomechanical Metrics

The system analyzes **Running Gait Analysis** in the sagittal plane:

1. **Sagittal Trunk Inclination (degrees)**: Angle between the vertical axis and the midpoint of shoulders to hips vector.
2. **Knee Flexion Angle (degrees)**: Computed via 2D vector dot product across Hip-Knee-Ankle joints for both left and right limbs.
3. **Bilateral Knee Symmetry Index (SI %)**:
   $$\text{SI} = \frac{2 \times |K_{\text{left}} - K_{\text{right}}|}{K_{\text{left}} + K_{\text{right}}} \times 100\%$$
   *(Lower is better; 0% = perfect bilateral symmetry)*.
4. **Step Cadence (steps/min)**: Periodic vertical oscillation frequency of ankle landmarks across temporal video frames.
5. **Data Quality Score (0–100%)**: Joint visibility confidence filter rejecting frames with $< 0.70$ visibility or videos where athlete framing is insufficient.

---

## 🗄️ Database Architecture

The PostgreSQL database (`sports_twin`) includes normalized, auditable tables:
- **`users`**: Secure Bcrypt credentials and timestamps.
- **`athletes`**: Athlete profile, sport, experience level, and anthropometrics.
- **`sessions`**: Ingested movement videos, duration, fps, resolution, and processing status (`PENDING`, `PROCESSING`, `COMPLETED`, `REJECTED`, `FAILED`).
- **`pose_metrics`** & **`performance_metrics`**: Validated session kinematics and confidence scores.
- **`personal_baselines`**: Rolling window distributions (mean, median, standard deviation, IQR, sample count, and confidence level `LOW`, `MODERATE`, `HIGH`).
- **`trend_results`**: Linear regression slopes and directional polarity (`IMPROVING`, `STABLE`, `DECLINING`).
- **`anomaly_results`**: Statistical deviations from personal baseline ($z$-scores and Isolation Forest anomaly scores).
- **`twin_states`**: Versioned, immutable state snapshots capturing athlete trajectory evolution over time.
- **`insights`** & **`recommendations`**: Grounded coaching recommendations and AI readbacks.

---

## 🚀 Getting Started & Execution

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.13)
- PostgreSQL running locally on port 5432 (`postgres:postgres@localhost:5432/sports_twin`)

### 2. Backend Setup & Migrations
```bash
# Navigate to backend
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Run database migrations to head
alembic upgrade head

# Start FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at:
- Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 3. Running Automated Tests
From the project root:
```bash
python -m pytest backend/tests -v
```
*(All 10 test suites covering Auth, Metrics, Baselines, Deviations, Twin State Versioning, Demo Seeding, and E2E Video Processing pass cleanly).*

### 4. Running the Flutter Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

### 5. Running the Complete React Web Application 🌐
The project includes a dedicated, responsive web frontend built with **React 18 + TypeScript + Vite + Tailwind CSS**:
```bash
# Navigate to web application directory
cd web

# Install dependencies
npm install

# Start local development server (runs at http://localhost:5173)
npm run dev

# Or create an optimized production build
npm run build
```
The website provides:
- **Landing Page**: Explains computer vision pipeline, 33 BlazePose landmarks, baseline mathematics, and digital twin state machine.
- **Athlete Authentication**: Login & registration with biometric intake (sport, experience level, height, weight).
- **Twin Dashboard**: Live digital twin state monitor, version snapshot, 4-metric telemetry grid, and recent session table.
- **Drag-and-Drop Video Upload**: Video dropzone, format/size validation, and OpenCV + BlazePose landmark extraction progress.
- **Session Telemetry View**: Ingested video player playback, joint angles (trunk, left/right knee), confidence scores, and step cadence.
- **Session History Log**: Searchable and filterable table of all recorded and demo sessions.
- **Persistent Digital Twin Page**: Version progression timeline (`v1 -> v2 -> ...`), IQR baseline distribution table, and audit trail.
- **Kinematic Trajectory & Trends**: Recharts interactive spline curves with baseline bounds and anomaly flags.
- **Gemini AI Coaching**: Structured drill recommendations and biomechanical rationales powered by Gemini 3.8 Flash.
- **Athlete Profile & Settings**: Anthropometrics editing, backend connectivity status, and system architecture specifications.

---

## 🧪 Simulated Demo Progression Mode

For academic demonstration without recording live videos, the system provides an auditable demo seeder:
- Call `POST /api/v1/demo/seed` with an authenticated athlete.
- Seeds 5 progressive training sessions across 2 weeks demonstrating:
  - Session 1-2: Data collection & baseline building.
  - Session 3: Personal baseline established (`LOW` confidence).
  - Session 4-5: Improving symmetry and cadence with `ROBUST` baseline.
- All demo data is strictly labeled with `is_demo_data: true`.

---

## ⚠️ Scientific & Regulatory Disclaimer

> [!CAUTION]
> **NOT A MEDICAL DEVICE**: The Personal Sports Digital Twin is strictly a performance-monitoring and engineering research tool. It does NOT diagnose injuries, detect pathology, or prescribe medical treatment. All "deviations" and "variations" represent statistical variances relative to personal history and must not be interpreted as physical injury.
