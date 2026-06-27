from typing import Any, Optional

from fastapi.encoders import jsonable_encoder


def success_response(message: str, data: Optional[Any] = None) -> dict:
    return {"success": True, "message": message, "data": jsonable_encoder(data)}


def failure_response(message: str) -> dict:
    return {"success": False, "message": message}

