from fastapi import APIRouter, Depends, Query
from typing import List

from backend.routes.dependencies import get_log_service
from backend.services.log_service import LogService
from backend.utils.responses import success_response

router = APIRouter(tags=["Activity Timeline"])


@router.get("/activity")
async def get_activity(
    limit: int = Query(default=50, ge=1, le=200),
    log_service: LogService = Depends(get_log_service),
) -> dict:
    logs = await log_service.list_logs(limit=limit)
    
    formatted_logs = []
    for log in logs:
        # Determine category based on action or status
        category = "system"
        if log.action == "LOCK":
            category = "lock"
        elif log.status in ("ALERT", "danger"):
            category = "threat"
        elif log.action == "TELEGRAM":
            category = "telegram"
            
        # Format display time
        time_str = log.timestamp.strftime("%I:%M:%S %p") if log.timestamp else "Just now"
        
        # Build readable description
        description = log.event
        if log.details:
            if "confidence" in log.details:
                description = f"{log.event} (Confidence: {log.details['confidence']}%)"
            elif "reason" in log.details:
                description = f"{log.event}: {log.details['reason']}"
                
        formatted_logs.append({
            "id": log.id,
            "description": description,
            "time": time_str,
            "category": category
        })
        
    return success_response("Activity timeline retrieved successfully.", formatted_logs)
