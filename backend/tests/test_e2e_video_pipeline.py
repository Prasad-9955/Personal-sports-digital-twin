import os
import uuid
import pytest
import cv2
import numpy as np

def create_synthetic_running_video(filepath: str, duration_sec: float = 3.0, fps: int = 30):
    """
    Generates a synthetic MP4 video of a stick figure running to verify
    the OpenCV and MediaPipe BlazePose ingestion pipeline.
    """
    width, height = 640, 480
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filepath, fourcc, fps, (width, height))

    total_frames = int(duration_sec * fps)
    for frame_idx in range(total_frames):
        frame = np.ones((height, width, 3), dtype=np.uint8) * 240  # Off-white background
        t = frame_idx / fps
        freq = 2.8  # Running cadence oscillation

        # Center coordinates
        center_x = int(width * 0.5)
        head_y = 100
        shoulder_y = 150
        hip_y = 260

        # Draw Head
        cv2.circle(frame, (center_x, head_y), 25, (50, 50, 50), -1)

        # Draw Torso
        cv2.line(frame, (center_x, shoulder_y), (center_x, hip_y), (50, 50, 50), 6)

        # Draw Shoulders
        cv2.line(frame, (center_x - 40, shoulder_y), (center_x + 40, shoulder_y), (50, 50, 50), 6)

        # Oscillating leg positions (running gait)
        leg_phase = 2 * np.pi * freq * t
        left_knee_x = int(center_x - 30 + 35 * np.sin(leg_phase))
        left_knee_y = int(340 + 20 * np.cos(leg_phase))
        left_ankle_x = int(left_knee_x + 20 * np.sin(leg_phase + 0.5))
        left_ankle_y = int(420 + 25 * np.cos(leg_phase))

        right_knee_x = int(center_x + 30 - 35 * np.sin(leg_phase))
        right_knee_y = int(340 - 20 * np.cos(leg_phase))
        right_ankle_x = int(right_knee_x - 20 * np.sin(leg_phase + 0.5))
        right_ankle_y = int(420 - 25 * np.cos(leg_phase))

        # Left Leg
        cv2.line(frame, (center_x - 20, hip_y), (left_knee_x, left_knee_y), (180, 50, 50), 5)
        cv2.line(frame, (left_knee_x, left_knee_y), (left_ankle_x, left_ankle_y), (180, 50, 50), 5)

        # Right Leg
        cv2.line(frame, (center_x + 20, hip_y), (right_knee_x, right_knee_y), (50, 50, 180), 5)
        cv2.line(frame, (right_knee_x, right_knee_y), (right_ankle_x, right_ankle_y), (50, 50, 180), 5)

        out.write(frame)

    out.release()

def test_full_video_upload_and_process_pipeline(client, tmp_path):
    # 1. Register test user
    email = f"runner_e2e_{uuid.uuid4().hex[:8]}@example.com"
    reg_resp = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "display_name": "E2E Athlete",
        "sport": "running"
    })
    assert reg_resp.status_code == 201
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create synthetic test video file
    video_path = str(tmp_path / "synthetic_run.mp4")
    create_synthetic_running_video(video_path, duration_sec=2.5, fps=30)
    assert os.path.exists(video_path)

    # 3. Upload Video
    with open(video_path, "rb") as vf:
        upload_resp = client.post(
            "/api/v1/sessions/upload",
            files={"file": ("synthetic_run.mp4", vf, "video/mp4")},
            headers=headers
        )
    assert upload_resp.status_code == 201
    session_data = upload_resp.json()
    assert session_data["processing_status"] == "PENDING"
    assert session_data["duration_sec"] >= 2.0
    session_id = session_data["id"]

    # 4. Trigger Video Analysis & Twin Update
    process_resp = client.post(f"/api/v1/sessions/{session_id}/process", headers=headers)
    assert process_resp.status_code == 200
    res = process_resp.json()
    assert res["processing_status"] in ["COMPLETED", "REJECTED"]
    if res["processing_status"] == "COMPLETED":
        assert len(res["pose_metrics"]) > 0
        assert res["quality_score"] is not None

        # Verify Twin updated
        twin_resp = client.get("/api/v1/twin", headers=headers)
        assert twin_resp.status_code == 200
        twin = twin_resp.json()
        assert twin["total_sessions"] >= 1
        assert twin["active_state"] is not None
