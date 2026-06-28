import httpx

try:
    from Ai.config import settings
except ImportError:
    from config import settings


def notify_backend_detection(person_present: bool, confidence: float) -> dict:
    payload = {
        "personDetected": person_present,
        "confidence": confidence * 100 if confidence <= 1 else confidence,
    }

    with httpx.Client(timeout=10.0) as client:
        response = client.post(settings.backend_detect_url, json=payload)
        response.raise_for_status()
        return response.json()
