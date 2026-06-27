from fastapi import APIRouter, Depends

from backend.routes.dependencies import get_status_service
from backend.services.status_service import StatusService
from backend.utils.responses import success_response

router = APIRouter(tags=["Monitoring"])


@router.get("/status")
async def get_status(status_service: StatusService = Depends(get_status_service)) -> dict:
    status = await status_service.get_status()
    return success_response("Monitoring status retrieved successfully.", status)

