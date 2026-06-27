import ctypes
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException

try:
    from Ai.camera import capture_frame
    from Ai.config import settings
    from Ai.detector import PresenceState, update_presence
    from Ai.afferens_client import analyze_frame
except ImportError:
    from camera import capture_frame
    from config import settings
    from detector import PresenceState, update_presence
    from afferens_client import analyze_frame

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

    return {
        'action': state.current_mode,
        'person_present': analysis.get('person_present', False),
        'confidence': analysis.get('confidence', 0.0),
        'reason': analysis.get('reason', 'no details'),
        'last_seen': state.last_present.isoformat() + 'Z',
    }


@app.get('/status')
def status():
    return {
        'action': state.current_mode,
        'last_seen': state.last_present.isoformat() + 'Z',
        'absence_timeout_seconds': settings.absence_timeout_seconds,
    }


@app.get('/')
def root():
    return {
        'service': 'Guardian AI',
        'message': 'The API is running. Use /sense or /status.',
        'endpoints': ['/sense', '/status', '/docs'],
    }
