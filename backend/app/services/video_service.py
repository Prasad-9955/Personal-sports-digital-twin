import os
import uuid
import hashlib
from pathlib import Path
from typing import Tuple, Dict, Any, Optional
import cv2
from fastapi import UploadFile, HTTPException, status
from app.config import settings

class VideoService:
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.allowed_extensions = {ext.strip().lower() for ext in settings.ALLOWED_EXTENSIONS.split(",")}
        self.max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    def validate_and_save_upload(self, file: UploadFile) -> Tuple[str, str]:
        """
        Validates uploaded file extension, size, and saves to upload directory safely.
        Returns (stored_filename, absolute_filepath).
        """
        filename = file.filename or ""
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in self.allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported video format '.{ext}'. Allowed formats: {', '.join(self.allowed_extensions)}"
            )

        # Generate a safe unguessable filename
        unique_id = uuid.uuid4().hex
        stored_filename = f"{unique_id}.{ext}"
        destination_path = self.upload_dir / stored_filename

        total_bytes = 0
        try:
            with open(destination_path, "wb") as buffer:
                while chunk := file.file.read(1024 * 1024):  # 1MB chunks
                    total_bytes += len(chunk)
                    if total_bytes > self.max_bytes:
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail=f"Video exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB"
                        )
                    buffer.write(chunk)
        except HTTPException:
            if destination_path.exists():
                destination_path.unlink()
            raise
        except Exception as e:
            if destination_path.exists():
                destination_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save video: {str(e)}"
            )

        return stored_filename, str(destination_path.resolve())

    def inspect_video(self, video_path: str) -> Dict[str, Any]:
        """
        Inspects video headers using OpenCV to verify decodability, duration, fps, and resolution.
        """
        if not os.path.exists(video_path):
            raise ValueError(f"Video file not found at {video_path}")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError("OpenCV could not open or decode the video file.")

        fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
        cap.release()

        duration = (frame_count / fps) if fps > 0 else 0.0

        if duration < 1.5:
            raise ValueError(f"Video duration is too short ({duration:.1f}s). Minimum required is 1.5 seconds.")
        if duration > 300.0:
            raise ValueError(f"Video duration is too long ({duration:.1f}s). Maximum allowed is 300 seconds.")

        return {
            "fps": round(fps, 2),
            "frame_count": frame_count,
            "width": width,
            "height": height,
            "resolution": f"{width}x{height}",
            "duration_sec": round(duration, 2),
        }

video_service = VideoService()
