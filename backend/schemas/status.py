from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SystemStatus(BaseModel):
    monitoring_active: bool
    current_status: str
    last_seen_at: Optional[datetime] = None
    last_action: str = "NONE"
    updated_at: datetime

