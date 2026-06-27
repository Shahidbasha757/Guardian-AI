from datetime import datetime, timezone
from typing import Optional

from backend.config.settings import get_settings
from backend.database.repository import Repository
from backend.schemas.status import SystemStatus


class StatusService:
    collection = "SystemStatus"
    document_id = "current"

    def __init__(self, repository: Repository) -> None:
        self.repository = repository

    async def get_status(self) -> SystemStatus:
        document = await self.repository.get(self.collection, self.document_id)
        if document:
            return SystemStatus(**document)

        settings = get_settings()
        status = SystemStatus(
            monitoring_active=settings.default_monitoring_active,
            current_status="MONITORING" if settings.default_monitoring_active else "PAUSED",
            updated_at=datetime.now(timezone.utc),
        )
        await self.repository.set(self.collection, self.document_id, status.model_dump())
        return status

    async def update_status(
        self,
        *,
        monitoring_active: Optional[bool] = None,
        current_status: Optional[str] = None,
        last_seen_at: Optional[datetime] = None,
        last_action: str = "NONE",
    ) -> SystemStatus:
        existing = await self.get_status()
        status = SystemStatus(
            monitoring_active=existing.monitoring_active if monitoring_active is None else monitoring_active,
            current_status=current_status or existing.current_status,
            last_seen_at=last_seen_at if last_seen_at is not None else existing.last_seen_at,
            last_action=last_action,
            updated_at=datetime.now(timezone.utc),
        )
        await self.repository.set(self.collection, self.document_id, status.model_dump())
        return status

