from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from backend.routes.dependencies import get_auth_service
from backend.schemas.auth import LoginRequest, RegisterRequest
from backend.services.auth_service import AuthService
from backend.utils.responses import failure_response, success_response

router = APIRouter(tags=["Authentication"])


@router.post("/register")
async def register(payload: RegisterRequest, auth_service: AuthService = Depends(get_auth_service)) -> dict:
    try:
        user = await auth_service.register(payload)
        return success_response("User registered successfully.", user)
    except HTTPException as exc:
        return JSONResponse(status_code=exc.status_code, content=failure_response(str(exc.detail)))


@router.post("/login")
async def login(payload: LoginRequest, auth_service: AuthService = Depends(get_auth_service)) -> dict:
    try:
        data = await auth_service.login(payload)
        return success_response("User logged in successfully.", data)
    except HTTPException as exc:
        return JSONResponse(status_code=exc.status_code, content=failure_response(str(exc.detail)))
