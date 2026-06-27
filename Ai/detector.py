from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Dict


@dataclass
class PresenceState:
    last_present: datetime = field(default_factory=lambda: datetime.utcnow())
    current_mode: str = 'monitor'
    last_response: Dict[str, Any] = field(default_factory=dict)


def update_presence(state: PresenceState, response: Dict[str, Any], timeout_seconds: int) -> PresenceState:
    now = datetime.utcnow()
    present = bool(response.get('person_present', False))

    if present:
        state.last_present = now
        state.current_mode = 'monitor'
    else:
        if now - state.last_present >= timedelta(seconds=timeout_seconds):
            state.current_mode = 'lock_pc'
        else:
            state.current_mode = 'monitor'

    state.last_response = response
    return state
