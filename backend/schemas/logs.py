from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class LogCreateRequest(BaseModel):
    event: str = Field(min_length=1, max_length=120)
    action: str = Field(default="NONE", max_length=80)
    status: str = Field(default="INFO", max_length=80)
    details: Optional[dict] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ActivityLog(BaseModel):
    id: str
    timestamp: datetime
    event: str
    action: str
    status: str
    details: Optional[dict] = None

