from datetime import datetime, timezone

from backend.schemas.detection import DetectionDecision, DetectionRequest
from backend.schemas.logs import LogCreateRequest
from backend.services.log_service import LogService
from backend.services.status_service import StatusService


class DecisionService:
    def __init__(self, status_service: StatusService, log_service: LogService) -> None:
        self.status_service = status_service
        self.log_service = log_service

    async def process_detection(self, detection: DetectionRequest) -> DetectionDecision:
        event_time = detection.timestamp or datetime.now(timezone.utc)

        if detection.person_detected:
            status = await self.status_service.update_status(
                monitoring_active=True,
                current_status="PERSON_DETECTED",
                last_seen_at=event_time,
                last_action="NONE",
            )
            await self.log_service.create_log(
                LogCreateRequest(
                    timestamp=event_time,
                    event="Person Detected",
                    action="NONE",
                    status="OK",
                    details={"confidence": detection.confidence},
                )
            )
            return DetectionDecision(
                action="NONE",
                status=status.current_status,
                monitoring_active=status.monitoring_active,
                last_seen_at=status.last_seen_at,
                timestamp=event_time,
            )

        status = await self.status_service.update_status(
            monitoring_active=True,
            current_status="PERSON_MISSING",
            last_action="LOCK",
        )
        await self.log_service.create_log(
            LogCreateRequest(
                timestamp=event_time,
                event="Person Missing",
                action="LOCK",
                status="ALERT",
                details={"confidence": detection.confidence},
            )
        )
        await self.log_service.create_log(
            LogCreateRequest(
                timestamp=event_time,
                event="Lock Triggered",
                action="LOCK",
                status="PENDING_EXECUTION",
                details={"reason": "No person detected by AI module"},
            )
        )
        return DetectionDecision(
            action="LOCK",
            status=status.current_status,
            monitoring_active=status.monitoring_active,
            last_seen_at=status.last_seen_at,
            timestamp=event_time,
        )

