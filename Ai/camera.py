def capture_frame(camera_index: int = 0) -> bytes:
    try:
        import cv2
    except ImportError as exc:
        raise RuntimeError(
            "OpenCV is not installed. Install Ai/requirements.txt if you want /sense webcam capture."
        ) from exc

    cap = cv2.VideoCapture(camera_index)

    if not cap.isOpened():
        raise RuntimeError(f"Unable to open webcam at index {camera_index}")

    ret, frame = cap.read()
    cap.release()

    if not ret or frame is None:
        raise RuntimeError("Failed to capture a valid frame from the webcam")

    success, encoded = cv2.imencode(".jpg", frame)
    if not success or encoded is None:
        raise RuntimeError("Failed to encode webcam frame to JPEG")

    return encoded.tobytes()
