from backend.database.repository import Repository, get_repository
from backend.services.auth_service import AuthService
from backend.services.decision_service import DecisionService
from backend.services.log_service import LogService
from backend.services.status_service import StatusService


def get_log_service() -> LogService:
    return LogService(get_repository())


def get_status_service() -> StatusService:
    return StatusService(get_repository())


def get_decision_service() -> DecisionService:
    repository: Repository = get_repository()
    return DecisionService(StatusService(repository), LogService(repository))


def get_auth_service() -> AuthService:
    repository: Repository = get_repository()
    return AuthService(repository, LogService(repository))

