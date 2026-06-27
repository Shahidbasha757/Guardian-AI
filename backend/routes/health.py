from fastapi import APIRouter

from backend.utils.responses import success_response

router = APIRouter(tags=["Health"])


@router.get("/")
async def root() -> dict:
    return success_response("Guardian AI backend is running.", {"service": "guardian-ai-backend"})


@router.get("/health")
async def health() -> dict:
    return success_response("System healthy.", {"status": "UP"})

