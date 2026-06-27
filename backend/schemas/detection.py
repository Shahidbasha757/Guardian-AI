from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel, Field, model_validator


class DetectionRequest(BaseModel):
    person_detected: bool
    confidence: float = Field(ge=0, le=100)
    timestamp: Optional[datetime] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "personDetected": True,
                "confidence": 98.5,
                "timestamp": "2026-06-27T10:00:00Z",
            }
        }
    }

    @model_validator(mode="before")
    @classmethod
    def accept_ai_payload_keys(cls, values: Any) -> Any:
        if isinstance(values, dict) and "personDetected" in values and "person_detected" not in values:
            values = {**values, "person_detected": values["personDetected"]}
        return values


class DetectionDecision(BaseModel):
    action: str
    status: str
    monitoring_active: bool
    last_seen_at: Optional[datetime] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
