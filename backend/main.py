from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config.settings import get_settings
from backend.routes import (
    auth,
    detection,
    health,
    logs,
    status,
    activity,
    settings,
    telegram,
    lock,
    analytics,
    reports,
)
from backend.utils.responses import failure_response


settings_obj = get_settings()

app = FastAPI(
    title=settings_obj.app_name,
    version=settings_obj.app_version,
    description="Decision-making backend for the Guardian AI monitoring loop.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings_obj.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(detection.router)
app.include_router(status.router)
app.include_router(logs.router)
app.include_router(activity.router)
app.include_router(settings.router)
app.include_router(telegram.router)
app.include_router(lock.router)
app.include_router(analytics.router)
app.include_router(reports.router)



@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=failure_response(str(exc.detail)))


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content=failure_response(str(exc.errors())))
