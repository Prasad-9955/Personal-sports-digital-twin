# Testing Strategy & Verification Guide — Personal Sports Digital Twin

## 1. Automated Backend Test Suite

The automated test suite in `backend/tests/` verifies the entire computational pipeline, authentication, mathematical formulations, baseline gating, trend directionality, and end-to-end video processing.

### Test Execution Command
Run from the project root (`c:\Users\manda\Desktop\mini`):
```bash
python -m pytest backend/tests -v
```

### Test Coverage Breakdown

| File | Purpose & Verification Scope | Status |
| :--- | :--- | :--- |
| `test_auth.py` | Validates Bcrypt password hashing, JWT creation & decoding, duplicate account rejection, and 401 unauthorized route guards. | **PASSED** |
| `test_metrics.py` | Validates vector angle calculations (90° right angles, 180° straight lines), trunk inclination trigonometric formulas, and bilateral symmetry index mathematical formulation. | **PASSED** |
| `test_analytics_and_twin.py` | Tests sample count gating ($N < 3$ rejection, $N \ge 3$ median/IQR calculation), trend regression slopes, modified $Z$-score anomaly triggers, and atomic Twin state version snapshots (v1 -> v2). | **PASSED** |
| `test_demo_and_gemini.py` | Tests Gemini structured prompt grounding, fallback rule-based template generation when offline, and the 5-session simulated demo seeding route. | **PASSED** |
| `test_e2e_video_pipeline.py` | Programmatically generates a synthetic running video via OpenCV, uploads it through multipart API, processes frames with MediaPipe BlazePose, and confirms session completion and twin state updates. | **PASSED** |

---

## 2. Manual Verification & Demo Runthrough

### Starting the Backend Server
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive OpenAPI documentation will be accessible at:
- `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### Running the Flutter Mobile Client
```bash
cd mobile
flutter pub get
flutter run
```
