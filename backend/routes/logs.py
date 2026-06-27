from fastapi import APIRouter, Depends, Query

from backend.routes.dependencies import get_log_service
from backend.schemas.logs import LogCreateRequest
from backend.services.log_service import LogService
from backend.utils.responses import success_response

router = APIRouter(tags=["Logs"])


@router.get("/logs")
async def get_logs(
    limit: int = Query(default=50, ge=1, le=200),
    log_service: LogService = Depends(get_log_service),
) -> dict:
    logs = await log_service.list_logs(limit=limit)
    return success_response("Activity logs retrieved successfully.", logs)


@router.post("/logs")
async def create_log(payload: LogCreateRequest, log_service: LogService = Depends(get_log_service)) -> dict:
    log = await log_service.create_log(payload)
    return success_response("Activity log created successfully.", log)

