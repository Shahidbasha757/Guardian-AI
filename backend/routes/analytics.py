from fastapi import APIRouter
from backend.utils.responses import success_response

router = APIRouter(tags=["Analytics"])

ANALYTICS_DATASETS = {
    "daily": [
        {"time": "09:00", "presence": 95, "confidence": 98, "alerts": 0, "accuracy": 97.4},
        {"time": "10:00", "presence": 90, "confidence": 97, "alerts": 1, "accuracy": 98.2},
        {"time": "11:00", "presence": 10, "confidence": 95, "alerts": 2, "accuracy": 96.8},
        {"time": "12:00", "presence": 98, "confidence": 99, "alerts": 0, "accuracy": 99.1},
        {"time": "13:00", "presence": 99, "confidence": 98, "alerts": 0, "accuracy": 98.5},
        {"time": "14:00", "presence": 5, "confidence": 94, "alerts": 3, "accuracy": 97.2},
        {"time": "15:00", "presence": 92, "confidence": 96, "alerts": 1, "accuracy": 98.0},
        {"time": "16:00", "presence": 96, "confidence": 97, "alerts": 0, "accuracy": 98.3},
    ],
    "weekly": [
        {"day": "Mon", "presence": 88, "confidence": 96, "alerts": 2, "accuracy": 98.1},
        {"day": "Tue", "presence": 92, "confidence": 97, "alerts": 1, "accuracy": 97.9},
        {"day": "Wed", "presence": 85, "confidence": 95, "alerts": 5, "accuracy": 98.4},
        {"day": "Thu", "presence": 90, "confidence": 96, "alerts": 2, "accuracy": 98.2},
        {"day": "Fri", "presence": 94, "confidence": 98, "alerts": 4, "accuracy": 98.8},
        {"day": "Sat", "presence": 12, "confidence": 92, "alerts": 0, "accuracy": 96.5},
        {"day": "Sun", "presence": 5, "confidence": 90, "alerts": 1, "accuracy": 96.2},
    ],
    "monthly": [
        {"week": "Week 1", "presence": 89, "confidence": 97, "alerts": 10, "accuracy": 98.0},
        {"week": "Week 2", "presence": 91, "confidence": 96, "alerts": 8, "accuracy": 97.8},
        {"week": "Week 3", "presence": 87, "confidence": 98, "alerts": 12, "accuracy": 98.3},
        {"week": "Week 4", "presence": 93, "confidence": 97, "alerts": 5, "accuracy": 98.5},
    ]
}


@router.get("/analytics")
async def get_analytics() -> dict:
    return success_response("Analytics data retrieved successfully.", ANALYTICS_DATASETS)
