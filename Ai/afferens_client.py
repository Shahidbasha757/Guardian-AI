import base64
import httpx

try:
    from Ai.config import settings
except ImportError:
    from config import settings


def analyze_frame(frame_bytes: bytes) -> dict:
    if settings.mock_afferens:
        return {
            'person_present': True,
            'confidence': 0.85,
            'reason': 'mock presence detected',
            'raw': {'mock': True},
        }

    if not settings.api_key:
        raise RuntimeError('Afferens API key is not configured')

    payload = {
        'image': base64.b64encode(frame_bytes).decode('ascii'),
        'mime_type': 'image/jpeg',
    }

    headers = {
        'Authorization': f'Bearer {settings.api_key}',
        'Content-Type': 'application/json',
    }

    try:
        with httpx.Client(timeout=20.0) as client:
            response = client.post(settings.afferens_endpoint, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
    except httpx.RequestError as exc:
        raise RuntimeError(f"Unable to reach Afferens API at {settings.afferens_endpoint}: {exc}")
    except httpx.HTTPStatusError as exc:
        raise RuntimeError(f"Afferens API returned error {exc.response.status_code}: {exc.response.text}")

    person_present = bool(data.get('person_present', False) or data.get('presence', False))
    confidence = float(data.get('confidence', 0.0)) if data.get('confidence') is not None else 0.0
    reason = data.get('reason', data.get('status', 'unknown'))

    return {
        'person_present': person_present,
        'confidence': confidence,
        'reason': reason,
        'raw': data,
    }
