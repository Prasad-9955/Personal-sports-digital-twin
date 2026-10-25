import os
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

class PoseLandmarkIndex:
    NOSE = 0
    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12
    LEFT_ELBOW = 13
    RIGHT_ELBOW = 14
    LEFT_WRIST = 15
    RIGHT_WRIST = 16
    LEFT_HIP = 23
    RIGHT_HIP = 24
    LEFT_KNEE = 25
    RIGHT_KNEE = 26
    LEFT_ANKLE = 27
    RIGHT_ANKLE = 28
    LEFT_HEEL = 29
    RIGHT_HEEL = 30
    LEFT_FOOT_INDEX = 31
    RIGHT_FOOT_INDEX = 32

class PoseService:
    def __init__(self):
        base_dir = Path(__file__).resolve().parent.parent
        self.model_path = base_dir / "models_assets" / "pose_landmarker_lite.task"
        self._landmarker = None

    def _get_landmarker(self):
        if self._landmarker is not None:
            return self._landmarker

        if not self.model_path.exists():
            raise FileNotFoundError(f"Pose landmarker model not found at {self.model_path}")

        options = vision.PoseLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=str(self.model_path)),
            running_mode=vision.RunningMode.IMAGE,
            min_pose_detection_confidence=0.5,
            min_tracking_confidence=0.5,
            num_poses=1
        )
        self._landmarker = vision.PoseLandmarker.create_from_options(options)
        return self._landmarker

    def extract_landmarks_from_video(self, video_path: str, sample_rate: int = 1) -> Dict[str, Any]:
        """
        Processes video frames with MediaPipe BlazePose.
        Extracts 33 landmarks and computes landmark quality scores.
        """
        landmarker = self._get_landmarker()
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Unable to open video at {video_path}")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        fps = float(cap.get(cv2.CAP_PROP_FPS) or 30.0)

        frames_data: List[Dict[str, Any]] = []
        valid_frames_count = 0
        confidences: List[float] = []

        frame_idx = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % sample_rate == 0:
                # MediaPipe expects RGB
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

                try:
                    detection_result = landmarker.detect(mp_image)
                    if detection_result.pose_landmarks and len(detection_result.pose_landmarks) > 0:
                        landmarks = detection_result.pose_landmarks[0]
                        
                        # Evaluate key biomechanical joints: shoulders, hips, knees, ankles
                        key_indices = [
                            PoseLandmarkIndex.LEFT_SHOULDER, PoseLandmarkIndex.RIGHT_SHOULDER,
                            PoseLandmarkIndex.LEFT_HIP, PoseLandmarkIndex.RIGHT_HIP,
                            PoseLandmarkIndex.LEFT_KNEE, PoseLandmarkIndex.RIGHT_KNEE,
                            PoseLandmarkIndex.LEFT_ANKLE, PoseLandmarkIndex.RIGHT_ANKLE,
                        ]
                        
                        key_visibilities = [landmarks[idx].visibility for idx in key_indices if landmarks[idx].visibility is not None]
                        avg_vis = float(np.mean(key_visibilities)) if key_visibilities else 0.85
                        confidences.append(avg_vis)

                        # Store landmark coordinates if quality meets minimum threshold
                        if avg_vis >= 0.50:
                            valid_frames_count += 1
                            raw_landmarks = [
                                {
                                    "x": float(lm.x),
                                    "y": float(lm.y),
                                    "z": float(lm.z),
                                    "visibility": float(lm.visibility if lm.visibility is not None else 1.0)
                                }
                                for lm in landmarks
                            ]
                            frames_data.append({
                                "frame_index": frame_idx,
                                "timestamp_sec": round(frame_idx / fps, 3),
                                "confidence": round(avg_vis, 3),
                                "landmarks": raw_landmarks
                            })
                except Exception as e:
                    pass

            frame_idx += 1

        cap.release()

        # Overall Session Quality Calculation
        overall_quality = 0.0
        if total_frames > 0:
            detection_ratio = len(frames_data) / max(1, (total_frames // sample_rate))
            avg_confidence = float(np.mean(confidences)) if confidences else 0.0
            overall_quality = round((detection_ratio * 0.5 + avg_confidence * 0.5) * 100.0, 1)

        is_acceptable = (len(frames_data) >= 15 and overall_quality >= 35.0)

        return {
            "total_frames": total_frames,
            "processed_frames": len(frames_data),
            "valid_frames_count": valid_frames_count,
            "quality_score": overall_quality,
            "is_acceptable": is_acceptable,
            "fps": fps,
            "frames": frames_data
        }

pose_service = PoseService()
