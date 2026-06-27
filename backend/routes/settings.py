from fastapi import APIRouter, Depends
from typing import Dict, Any

from backend.database.repository import Repository, get_repository
from backend.utils.responses import success_response

router = APIRouter(tags=["Settings"])

DEFAULT_SETTINGS = {
    "telegramToken": "629910485:AAE9Ox1b_m...",
    "telegramChatId": "981104859",
    "confidenceThreshold": 85,
    "lockOnAbsence": True,
    "isSimulating": True,
    "captureInterval": 5,
    "aiSensitivity": 80,
    "notificationToggle": True,
    "theme": "cyberpunk",
    "cameraSelection": "default_cam"
}


@router.get("/settings")
async def get_settings(repo: Repository = Depends(get_repository)) -> dict:
    settings = await repo.get("SystemSettings", "current")
    if not settings:
        settings = DEFAULT_SETTINGS.copy()
        await repo.set("SystemSettings", "current", settings)
    return success_response("Settings retrieved successfully.", settings)


@router.post("/settings")
async def save_settings(payload: dict, repo: Repository = Depends(get_repository)) -> dict:
    # Validate and merge with defaults to avoid missing keys
    existing = await repo.get("SystemSettings", "current") or DEFAULT_SETTINGS.copy()
    
    # Merge payload fields
    for k, v in payload.items():
        existing[k] = v
        
    await repo.set("SystemSettings", "current", existing)
    return success_response("Settings saved successfully.", existing)
