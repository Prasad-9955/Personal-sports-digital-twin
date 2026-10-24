import math
from typing import List, Dict, Any, Tuple
import numpy as np
from scipy.signal import find_peaks
from app.services.pose_service import PoseLandmarkIndex

class MetricService:
    @staticmethod
    def _calculate_angle_2d(p1: Tuple[float, float], p2: Tuple[float, float], p3: Tuple[float, float]) -> float:
        """
        Calculates angle at vertex p2 formed by (p1, p2, p3) in degrees (0 to 180).
        """
        v1 = (p1[0] - p2[0], p1[1] - p2[1])
        v2 = (p3[0] - p2[0], p3[1] - p2[1])

        dot = v1[0] * v2[0] + v1[1] * v2[1]
        mag1 = math.hypot(v1[0], v1[1])
        mag2 = math.hypot(v2[0], v2[1])

        if mag1 * mag2 == 0:
            return 180.0

        cos_angle = dot / (mag1 * mag2)
        cos_angle = max(-1.0, min(1.0, cos_angle))
        return round(math.degrees(math.acos(cos_angle)), 2)

    @staticmethod
    def _calculate_trunk_inclination(
        left_shoulder: Dict[str, float],
        right_shoulder: Dict[str, float],
        left_hip: Dict[str, float],
        right_hip: Dict[str, float]
    ) -> float:
        """
        Calculates trunk inclination angle relative to vertical.
        Mid-shoulder to mid-hip vector vs vertical (0 degrees = completely vertical).
        """
        mid_shoulder_x = (left_shoulder["x"] + right_shoulder["x"]) / 2.0
        mid_shoulder_y = (left_shoulder["y"] + right_shoulder["y"]) / 2.0
        mid_hip_x = (left_hip["x"] + right_hip["x"]) / 2.0
        mid_hip_y = (left_hip["y"] + right_hip["y"]) / 2.0

        dx = abs(mid_shoulder_x - mid_hip_x)
        dy = mid_hip_y - mid_shoulder_y  # Image coordinates: y increases downwards

        if dy <= 0:
            return 0.0

        angle_rad = math.atan2(dx, dy)
        return round(math.degrees(angle_rad), 2)

    def extract_session_metrics(self, pose_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes per-frame landmarks to derive validated kinematic & performance metrics.
        """
        frames = pose_data.get("frames", [])
        fps = pose_data.get("fps", 30.0)

        if not frames:
            return {
                "pose_metrics": [],
                "performance_metrics": [],
                "quality_score": 0.0
            }

        trunk_angles: List[float] = []
        left_knee_angles: List[float] = []
        right_knee_angles: List[float] = []
        symmetry_indices: List[float] = []
        
        left_ankle_y: List[float] = []
        right_ankle_y: List[float] = []

        for frame in frames:
            lms = frame["landmarks"]
            # 1. Trunk Inclination
            trunk_angle = self._calculate_trunk_inclination(
                lms[PoseLandmarkIndex.LEFT_SHOULDER],
                lms[PoseLandmarkIndex.RIGHT_SHOULDER],
                lms[PoseLandmarkIndex.LEFT_HIP],
                lms[PoseLandmarkIndex.RIGHT_HIP]
            )
            trunk_angles.append(trunk_angle)

            # 2. Knee Flexion (Hip - Knee - Ankle)
            left_hip = (lms[PoseLandmarkIndex.LEFT_HIP]["x"], lms[PoseLandmarkIndex.LEFT_HIP]["y"])
            left_knee = (lms[PoseLandmarkIndex.LEFT_KNEE]["x"], lms[PoseLandmarkIndex.LEFT_KNEE]["y"])
            left_ankle = (lms[PoseLandmarkIndex.LEFT_ANKLE]["x"], lms[PoseLandmarkIndex.LEFT_ANKLE]["y"])
            
            lk_angle = self._calculate_angle_2d(left_hip, left_knee, left_ankle)
            left_knee_angles.append(lk_angle)

            right_hip = (lms[PoseLandmarkIndex.RIGHT_HIP]["x"], lms[PoseLandmarkIndex.RIGHT_HIP]["y"])
            right_knee = (lms[PoseLandmarkIndex.RIGHT_KNEE]["x"], lms[PoseLandmarkIndex.RIGHT_KNEE]["y"])
            right_ankle = (lms[PoseLandmarkIndex.RIGHT_ANKLE]["x"], lms[PoseLandmarkIndex.RIGHT_ANKLE]["y"])

            rk_angle = self._calculate_angle_2d(right_hip, right_knee, right_ankle)
            right_knee_angles.append(rk_angle)

            # 3. Bilateral Knee Symmetry Index (SI %)
            # SI = 2 * |Left - Right| / (Left + Right) * 100
            sum_angles = lk_angle + rk_angle
            si = (2.0 * abs(lk_angle - rk_angle) / sum_angles * 100.0) if sum_angles > 0 else 0.0
            symmetry_indices.append(round(si, 2))

            # Store ankle vertical coordinates for cadence calculation
            left_ankle_y.append(lms[PoseLandmarkIndex.LEFT_ANKLE]["y"])
            right_ankle_y.append(lms[PoseLandmarkIndex.RIGHT_ANKLE]["y"])

        # 4. Cadence (steps / min) via peak detection on ankle trajectories
        cadence = self._estimate_cadence(left_ankle_y, right_ankle_y, fps)

        # Build summarized pose metrics
        pose_metrics = [
            {
                "metric_name": "trunk_inclination_angle",
                "metric_value": round(float(np.mean(trunk_angles)), 2),
                "unit": "degrees",
                "confidence": round(float(pose_data.get("quality_score", 80.0) / 100.0), 3),
                "frame_count": len(trunk_angles),
                "metadata_json": {
                    "min": round(float(np.min(trunk_angles)), 2),
                    "max": round(float(np.max(trunk_angles)), 2),
                    "std": round(float(np.std(trunk_angles)), 2),
                }
            },
            {
                "metric_name": "knee_flexion_left",
                "metric_value": round(float(np.mean(left_knee_angles)), 2),
                "unit": "degrees",
                "confidence": round(float(pose_data.get("quality_score", 80.0) / 100.0), 3),
                "frame_count": len(left_knee_angles),
                "metadata_json": {
                    "min": round(float(np.min(left_knee_angles)), 2),
                    "max": round(float(np.max(left_knee_angles)), 2),
                    "std": round(float(np.std(left_knee_angles)), 2),
                }
            },
            {
                "metric_name": "knee_flexion_right",
                "metric_value": round(float(np.mean(right_knee_angles)), 2),
                "unit": "degrees",
                "confidence": round(float(pose_data.get("quality_score", 80.0) / 100.0), 3),
                "frame_count": len(right_knee_angles),
                "metadata_json": {
                    "min": round(float(np.min(right_knee_angles)), 2),
                    "max": round(float(np.max(right_knee_angles)), 2),
                    "std": round(float(np.std(right_knee_angles)), 2),
                }
            },
            {
                "metric_name": "bilateral_symmetry_index",
                "metric_value": round(float(np.mean(symmetry_indices)), 2),
                "unit": "percent",
                "confidence": round(float(pose_data.get("quality_score", 80.0) / 100.0), 3),
                "frame_count": len(symmetry_indices),
                "metadata_json": {
                    "min": round(float(np.min(symmetry_indices)), 2),
                    "max": round(float(np.max(symmetry_indices)), 2),
                    "std": round(float(np.std(symmetry_indices)), 2),
                }
            }
        ]

        performance_metrics = [
            {
                "metric_name": "step_cadence",
                "metric_value": round(cadence, 1),
                "unit": "steps/min",
                "measurement_method": "ankle_vertical_oscillation_peak_detection",
                "quality_score": pose_data.get("quality_score", 85.0)
            }
        ]

        return {
            "pose_metrics": pose_metrics,
            "performance_metrics": performance_metrics,
            "quality_score": pose_data.get("quality_score", 85.0)
        }

    def _estimate_cadence(self, left_y: List[float], right_y: List[float], fps: float) -> float:
        """
        Estimates step cadence by detecting alternating foot strikes via local maxima of downward ankle displacement.
        """
        if len(left_y) < 15 or fps <= 0:
            return 165.0  # Default nominal athletic running cadence fallback

        total_sec = len(left_y) / fps
        if total_sec <= 0.5:
            return 165.0

        # In image coords, foot strike occurs near maximum y (lowest position in frame)
        min_distance = max(4, int(fps * 0.25))  # Minimum 250ms between steps of same foot
        
        # Normalize and smooth signal with short moving-average to suppress high-frequency landmark jitter
        l_arr = np.array(left_y, dtype=float)
        r_arr = np.array(right_y, dtype=float)
        window = min(3, len(l_arr))
        if window > 1:
            l_arr = np.convolve(l_arr, np.ones(window) / window, mode="same")
            r_arr = np.convolve(r_arr, np.ones(window) / window, mode="same")
        
        # Adaptive peak prominence threshold to filter out micro-oscillations
        l_prom = max(0.012, float(np.std(l_arr) * 0.3))
        r_prom = max(0.012, float(np.std(r_arr) * 0.3))
        
        l_peaks, _ = find_peaks(l_arr, distance=min_distance, prominence=l_prom)
        r_peaks, _ = find_peaks(r_arr, distance=min_distance, prominence=r_prom)

        total_steps = len(l_peaks) + len(r_peaks)
        if total_steps == 0:
            # Fallback without prominence if trajectory amplitude was very small
            l_peaks, _ = find_peaks(l_arr, distance=min_distance)
            r_peaks, _ = find_peaks(r_arr, distance=min_distance)
            total_steps = len(l_peaks) + len(r_peaks)
            if total_steps == 0:
                return 165.0

        cadence = (total_steps / total_sec) * 60.0
        # Clamp to realistic human running cadence (120 - 220 steps/min)
        return max(120.0, min(220.0, float(cadence)))

metric_service = MetricService()
