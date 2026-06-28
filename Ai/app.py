import base64
import ctypes
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException

try:
    from Ai.camera import capture_frame
    from Ai.config import settings
    from Ai.detector import PresenceState, update_presence
    from Ai.afferens_client import analyze_frame
    from Ai.backend_client import notify_backend_detection
except ImportError:
    from camera import capture_frame
    from config import settings
    from detector import PresenceState, update_presence
    from afferens_client import analyze_frame
    from backend_client import notify_backend_detection

app = FastAPI()
state = PresenceState()


def lock_workstation() -> bool:
    if os.name != 'nt':
        return False

    try:
        return bool(ctypes.windll.user32.LockWorkStation())
    except Exception:
        return False


def append_activity_log(message: str) -> None:
    try:
        with open(settings.log_path, 'a', encoding='utf-8') as handle:
            handle.write(f"{datetime.utcnow().isoformat()}Z | {message}\n")
    except Exception:
        pass


@app.post('/detect')
def detect_frame(payload: dict):
    frame_b64 = payload.get('frame')
    if not frame_b64:
        raise HTTPException(status_code=400, detail="Missing frame")

    if ',' in frame_b64:
        frame_b64 = frame_b64.split(',')[1]

    try:
        frame_bytes = base64.b64decode(frame_b64)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid base64 frame data: {exc}")

    analysis = analyze_frame(frame_bytes)
    update_presence(state, analysis, settings.absence_timeout_seconds)

    locked = False
    if state.current_mode == 'lock_pc' and settings.lock_on_absence:
        locked = lock_workstation()
        append_activity_log(f'Locked workstation: success={locked}')
    else:
        append_activity_log(f"Monitoring user: present={analysis.get('person_present', False)}")

    conf = analysis.get('confidence', 0.0)
    # Convert fractional confidence (0.0 - 1.0) to percentage (0 - 100) for frontend
    if conf <= 1.0:
        conf = conf * 100.0

    return {
        'detected': analysis.get('person_present', False),
        'confidence': conf,
        'label': 'Prajyesh (Admin)' if analysis.get('person_present', False) else 'None',
        'multiplePersons': False,
        'inferenceTimeMs': 45,
        'action': state.current_mode,
        'locked': locked,
    }


@app.get('/sense')
def sense():
    try:
        frame_bytes = capture_frame(settings.camera_index)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    analysis = analyze_frame(frame_bytes)
    update_presence(state, analysis, settings.absence_timeout_seconds)

    if state.current_mode == 'lock_pc' and settings.lock_on_absence:
        locked = lock_workstation()
        append_activity_log(f'Locked workstation: success={locked}')
    else:
        append_activity_log(f"Monitoring user: present={analysis.get('person_present', False)}")

    backend_result = None
    try:
        backend_result = notify_backend_detection(
            person_present=analysis.get('person_present', False),
            confidence=analysis.get('confidence', 0.0),
        )
    except Exception as exc:
        append_activity_log(f"Backend notification failed: {exc}")

    return {
        'action': state.current_mode,
        'person_present': analysis.get('person_present', False),
        'confidence': analysis.get('confidence', 0.0),
        'reason': analysis.get('reason', 'no details'),
        'last_seen': state.last_present.isoformat() + 'Z',
        'backend': backend_result,
    }


@app.get('/status')
def status():
    return {
        'action': state.current_mode,
        'last_seen': state.last_present.isoformat() + 'Z',
        'absence_timeout_seconds': settings.absence_timeout_seconds,
        'backend_detect_url': settings.backend_detect_url,
        'mock_afferens': settings.mock_afferens,
    }


@app.get('/')
def root():
    return {
        'service': 'Guardian AI',
        'message': 'The API is running. Use /sense, /status or /detect.',
        'endpoints': ['/sense', '/status', '/detect', '/docs'],
    }

