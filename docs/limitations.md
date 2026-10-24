# Scientific & Technical Limitations — Personal Sports Digital Twin

## 1. Biomechanical & Optical Limitations

### Single RGB Camera & 2D Projection
- **Planar Kinematics**: Optical 2D pose estimation projects 3D spatial human movement onto a 2D image sensor plane. Angles computed from 2D coordinates (such as knee flexion and trunk inclination) assume the motion occurs primarily parallel to the camera sensor (sagittal plane).
- **Parallax & Out-of-Plane Error**: If the camera is angled (e.g., 45 degrees relative to running path) or if significant transversal/frontal rotation occurs, apparent 2D angles will deviate from true anatomical angles.
- **Occlusion**: During contralateral leg cross-over or camera occlusion, MediaPipe BlazePose infers obscured joints based on kinematic prior distributions. We flag and filter out any frame where joint confidence is below $0.70$.

### Absolute Metric Gating (Stride Length vs. Cadence)
- **Stride Length**: Without calibrated ground targets, multi-camera stereoscopy, or metric fiducials, absolute spatial distances in meters cannot be scientifically guaranteed. Therefore, absolute stride length is explicitly omitted from uncalibrated 2D video outputs.
- **Cadence**: Temporal measures (steps per minute) depend on stable video frame rates ($\ge 24\text{ fps}$). Videos with variable frame rates or $< 20\text{ fps}$ are rejected.

## 2. Machine Learning & Statistical Validity

### Sample Size Requirements
- **Statistical Baselines**: Calculating personal baselines requires sufficient observations:
  - $N < 3$ sessions: `INSUFFICIENT_DATA` (no baseline constructed; user is prompted to complete more sessions).
  - $3 \le N < 5$ sessions: `LOW_CONFIDENCE` (non-parametric median and IQR used).
  - $N \ge 5$ sessions: `ROBUST` (mean, median, standard deviation, and rolling trends).
- **Isolation Forest**: Machine learning outlier detection algorithms require a critical mass of training points to avoid high false positive rates. We restrict scikit-learn `IsolationForest` to athletes with at least $10$ recorded sessions; below that, robust statistical modified $Z$-scores are utilized.

## 3. Medical & Regulatory Disclaimer

> [!CAUTION]
> **NOT A MEDICAL DEVICE**: The Personal Sports Digital Twin system is strictly an academic, performance-monitoring, and sports-engineering tool. It is NOT a medical device, diagnostic system, or clinical rehabilitation instrument.
>
> It does NOT diagnose injuries, detect pathology, or prescribe medical treatment. All "deviations" and "anomalies" represent statistical variations relative to an athlete's personal recorded history and must not be interpreted as physical impairment or clinical diagnosis.
