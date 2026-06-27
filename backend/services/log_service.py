from typing import List

from backend.database.repository import Repository
from backend.schemas.logs import ActivityLog, LogCreateRequest


class LogService:
    collection = "ActivityLogs"

    def __init__(self, repository: Repository) -> None:
        self.repository = repository

    async def create_log(self, payload: LogCreateRequest) -> ActivityLog:
        document = await self.repository.create(self.collection, payload.model_dump())
        return ActivityLog(**document)

    async def list_logs(self, limit: int = 50) -> List[ActivityLog]:
        documents = await self.repository.list(self.collection, limit=limit)
        return [ActivityLog(**document) for document in documents]

