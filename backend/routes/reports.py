from fastapi import APIRouter
from backend.utils.responses import success_response

router = APIRouter(tags=["Security Reports"])

AUDIT_REPORTS = [
    {
        "id": "rep-1",
        "title": "Biometric Audit Check",
        "date": "2026-06-25",
        "threats": 2,
        "alerts": 4,
        "status": "Passed"
    },
    {
        "id": "rep-2",
        "title": "Daily Security Sweep",
        "date": "2026-06-26",
        "threats": 0,
        "alerts": 1,
        "status": "Passed"
    },
    {
        "id": "rep-3",
        "title": "Host Screenlock Compliance Check",
        "date": "2026-06-27",
        "threats": 5,
        "alerts": 8,
        "status": "Review"
    }
]


@router.get("/reports")
async def get_reports() -> dict:
    return success_response("Security reports retrieved successfully.", AUDIT_REPORTS)
