# Personal Sports Digital Twin — UI/UX Upgrade & Skill Progress Report

**Project:** Personal Sports Digital Twin  
**GitHub Repository:** [https://github.com/Prasad-9955/Personal-sports-digital-twin](https://github.com/Prasad-9955/Personal-sports-digital-twin)  
**Live Frontend:** [https://personal-sports-digital-twin.vercel.app](https://personal-sports-digital-twin.vercel.app)  
**Live Backend API:** [https://personal-sports-digital-twin.onrender.com](https://personal-sports-digital-twin.onrender.com)  
**Authoritative Documentation Date:** November 9, 2026  

---

## 1. Executive Summary & Product Vision

The **Personal Sports Digital Twin** has been upgraded from a basic telemetry viewer into a **premium, mobile-first AI sports performance platform**. The application maintains an athlete-specific, continuously evolving digital twin that ingests video movements, calculates computer-vision pose landmarks via MediaPipe and OpenCV, updates running baselines, identifies anomalies, and generates evidence-grounded AI coaching through Google Gemini.

### Core Research Mandate
A digital twin is **not** a static dashboard: when an athlete records or uploads a new movement session, their digital twin **genuinely updates its state representation using the newly observed metrics and historical session distributions**.

Crucially, to preserve sports science credibility, the platform **rejects naive "mastery" percentages** (e.g. claiming an athlete has "learned 70% of running"). Instead, athletic development is decoupled into four mathematically sound, scientifically distinct categories:

| Measurement Category | Scientific Definition & Grounding | Calculation Logic |
| :--- | :--- | :--- |
| **1. Training Completion** | Proportion of defined, measurable training goals achieved | `(Completed Goals / Total Goals) × 100` |
| **2. Skill Development** | Competency assessed against 6 biomechanical sports science criteria | Multi-parameter index evaluating technique, balance, cadence, posture, joint mechanics, and adherence |
| **3. Biomechanical Improvement** | Empirical parametric delta between initial baseline and current twin state | Parametric changes in cadence (spm), symmetry index (%), trunk angle (°), and knee extension (°) |
| **4. Training Consistency** | Longitudinal frequency and adherence to scheduled observation sessions | `(Completed Sessions / Target Baseline Sessions) × 100` |

---

## 2. Premium UI/UX Design System

The platform features an electric, modern sports-science aesthetic designed mobile-first:

- **Color Palette:**
  - **Deep Navy & Midnight Backgrounds:** `#090D16`, `#0F172A`, `#1E293B`
  - **Electric Cyan & Turquoise Highlights:** `#00F0FF`, `#00D2C4`
  - **Status & Diagnostic Accents:** Emerald Green (`#10B981`) for completed milestones/favorable deltas; Warning Amber (`#F59E0B`) for variations; Danger Coral (`#EF4444`) for critical deviations.
- **Glassmorphism & Micro-Interactions:**
  - Glass-like telemetry tiles with subtle backdrop blur (`backdrop-blur-md`, `bg-cardDark/80`).
  - Active state glow effects (`shadow-neon-cyan`).
  - Mobile bottom navigation bar for seamless one-handed navigation.
- **High-Resolution Visual Assets:**
  - **Hero Imagery:** Integrated high-resolution sports telemetry photograph (`sports_telemetry_hero.jpg`) showing a runner on a track with skeletal biomechanical overlays.
  - **Digital Twin Visualization:** Integrated holographic digital human motion visual (`digital_twin_hologram.png`) featuring 33-point BlazePose joint mesh and sagittal projection indicators.

---

## 3. Architecture & New Features

### A. New Page: Athlete Progress & Skill Development (`/progress`)
Accessed via desktop sidebar and mobile bottom navigation, this new page provides complete longitudinal visibility:

1. **Overall Progress Donut Chart:**
   - Visualizes goal completion breakdown: *Completed*, *In Progress*, and *Not Started*.
   - Features interactive tooltip and centered completion percentage callout.
2. **Estimated Time to Goal Completion:**
   - Projects target milestone dates based on historical improvement velocity (~4.5% improvement per analyzed session).
   - If history is insufficient (< 3 sessions), transparently explains that additional sessions are required to establish a valid velocity baseline.
3. **Skill Development Across 6 Sports Science Criteria:**
   - **Running Technique:** Coordinated trunk inclination and bilateral joint alignment.
   - **Bilateral Movement Balance:** Symmetry index across stance and swing phases (ideal SI $\le$ 5.0%).
   - **Cadence Consistency:** Autocorrelation step frequency (target 170–180 spm).
   - **Trunk Posture Stability:** Shoulder-to-hip centroid angle deviation (ideal 8°–12° forward lean).
   - **Knee Movement Control:** Bilateral knee extension range matching and peak flexion control.
   - **Training Consistency:** Longitudinal adherence required for baseline validity.
4. **Biomechanical Improvement Table (Parametric Deltas):**
   - Displays Initial Baseline vs Current State vs Measured Delta vs Percentage Change.
   - Classifies each parameter as favorable or neutral, with notes explaining the biomechanical significance.
5. **Interactive Training Goal Creation:**
   - Form allowing athletes to establish custom measurable goals (direction, metric preset, baseline, target, unit, target date) with automated progress tracking.
6. **Longitudinal Milestones Journey Track:**
   - Chronological timeline recording baseline ingestion, symmetry equalization, and multi-session state increments.

### B. Upgraded Pages & Navigation
- **AppShell (`web/src/components/layout/AppShell.tsx`):**
  - Added "Progress & Skills" (`/progress`) to desktop navigation.
  - Added fixed mobile bottom navigation bar with 5 primary thumb destinations: *Twin Dashboard*, *Analyze Video*, *Progress & Skills*, *Digital Twin State*, and *AI Coaching*.
- **Athlete Dashboard (`web/src/pages/DashboardPage.tsx`):**
  - Upgraded hero card with professional sports telemetry photography.
  - Converted quick actions into a 4-pillar grid.
  - Added Progress & Skills teaser card linking directly to the new matrix.
- **Digital Twin State (`web/src/pages/DigitalTwinPage.tsx`):**
  - Embedded holographic digital human motion visualization.
  - Added real-time baseline median vs latest measurement comparison cards with delta badges.
  - Replaced inflated labels with academically grounded "Statistical Baseline Model" badges.

---

## 4. Backend API Additions

### 1. Database Model (`backend/app/models.py`)
- Added `TrainingGoal` model:
  - Columns: `id`, `athlete_id`, `title`, `category`, `metric_name`, `target_direction`, `baseline_value`, `target_value`, `current_value`, `unit`, `target_date`, `progress_pct`, `status`, `created_at`, `completed_at`.
  - Relationship linked to `Athlete.training_goals`.

### 2. Router (`backend/app/routers/goals.py`)
- Mounted under prefix `/api/v1/goals`:
  - `GET /api/v1/goals`: Retrieves and re-evaluates all goals against latest twin telemetry.
  - `POST /api/v1/goals`: Creates new measurable goals with direction-aware progress clamping ($0.0\% - 100.0\%$).
  - `GET /api/v1/goals/progress-summary`: Calculates summary for the 4 measurement categories, 6 skill criteria, parametric deltas, velocity projection, and milestones.

---

## 5. Verification & Deployment

- **Backend Logic Unit Tests:**
  - `backend/tests/test_goals.py`: Verified `calculate_goal_progress` (INCREASE, DECREASE, clamp bounds), schema validations, and delta math (`3 passed in 0.07s`).
- **Frontend Production Build:**
  - Command: `npm run build --prefix web`
  - Output: `tsc -b && vite build` succeeded with code 0 (`built in 2.14s`).
- **Continuous Deployment:**
  - Code pushed to GitHub repository `main` branch.
  - Render automatically deploys backend with headless OpenCV/MediaPipe support (`libegl1`, `libgles2`, `libopengl0`).
  - Vercel automatically deploys frontend static production bundle.
