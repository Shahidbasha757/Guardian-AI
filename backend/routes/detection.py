from fastapi import APIRouter, Depends

from backend.routes.dependencies import get_decision_service
from backend.schemas.detection import DetectionRequest
from backend.services.decision_service import DecisionService
from backend.utils.responses import success_response

router = APIRouter(tags=["Detection"])


@router.post("/detect")
async def detect(
    payload: DetectionRequest,
    decision_service: DecisionService = Depends(get_decision_service),
) -> dict:
    decision = await decision_service.process_detection(payload)
    return success_response("Detection processed successfully.", decision)

