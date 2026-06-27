from fastapi import APIRouter, Depends
import ctypes
import os

from backend.routes.dependencies import get_log_service
from backend.services.log_service import LogService
from backend.schemas.logs import LogCreateRequest
from backend.utils.responses import success_response

router = APIRouter(tags=["Lock Enforcement"])


def lock_session() -> bool:
    if os.name != "nt":
        print("[Lock System] Lock workstation ignored (not running Windows NT).")
        return False
    try:
        return bool(ctypes.windll.user32.LockWorkStation())
    except Exception as exc:
        print(f"[Lock System] Failed to trigger user32.LockWorkStation: {exc}")
        return False


@router.post("/lock")
async def lock_workstation(log_service: LogService = Depends(get_log_service)) -> dict:
    success = lock_session()
    
    # Save lock alert in DB logs
    await log_service.create_log(
        LogCreateRequest(
            event="Workstation console auto-locked. Enforcing absence shielding.",
            action="LOCK",
            status="ALERT"
        )
    )
    
    return success_response("Workstation lock command executed.", {"locked": success})


@router.post("/unlock")
async def unlock_workstation(log_service: LogService = Depends(get_log_service)) -> dict:
    # Save unlock verification in DB logs
    await log_service.create_log(
        LogCreateRequest(
            event="Operator identity confirmed. Station restored.",
            action="NONE",
            status="OK"
        )
    )
    return success_response("Workstation unlock event logged.")
