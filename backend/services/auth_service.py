from datetime import datetime, timezone
from uuid import uuid4

import requests
from fastapi import HTTPException, status
from firebase_admin import auth as firebase_auth

from backend.config.settings import get_settings
from backend.database.firebase import get_firestore_client
from backend.database.repository import Repository
from backend.schemas.auth import LoginRequest, RegisterRequest, UserResponse
from backend.schemas.logs import LogCreateRequest
from backend.services.log_service import LogService


class AuthService:
    collection = "Users"

    def __init__(self, repository: Repository, log_service: LogService) -> None:
        self.repository = repository
        self.log_service = log_service
        self.settings = get_settings()

    async def register(self, payload: RegisterRequest) -> UserResponse:
        existing = await self.repository.find_one(self.collection, "email", payload.email)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists.")

        if get_firestore_client() is not None:
            firebase_user = firebase_auth.create_user(
                email=payload.email,
                password=payload.password,
                display_name=payload.display_name,
            )
            user_id = firebase_user.uid
            password_value = None
        else:
            user_id = str(uuid4())
            password_value = payload.password if self.settings.enable_local_auth_fallback else None

        document = {
            "id": user_id,
            "email": payload.email,
            "display_name": payload.display_name,
            "password": password_value,
            "created_at": datetime.now(timezone.utc),
        }
        await self.repository.set(self.collection, user_id, document)
        await self.log_service.create_log(
            LogCreateRequest(event="User Registered", action="NONE", status="OK", details={"email": payload.email})
        )
        return UserResponse(id=user_id, email=payload.email, display_name=payload.display_name)

    async def login(self, payload: LoginRequest) -> dict:
        if payload.email and payload.password and self.settings.firebase_web_api_key:
            return await self._login_with_firebase_password(payload.email, payload.password)
        if payload.email and payload.password:
            return await self._login_with_local_fallback(payload)
        if payload.id_token:
            return await self._login_with_id_token(payload.id_token)
        return await self._login_with_local_fallback(payload)

    async def _login_with_id_token(self, id_token: str) -> dict:
        try:
            decoded = firebase_auth.verify_id_token(id_token)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase ID token. For local Swagger testing, leave id_token empty and use email/password.",
            ) from exc

        user = UserResponse(
            id=decoded["uid"],
            email=decoded.get("email", ""),
            display_name=decoded.get("name"),
        )
        await self.log_service.create_log(
            LogCreateRequest(event="User Logged In", action="NONE", status="OK", details={"email": user.email})
        )
        return {"user": user.model_dump(), "idToken": id_token}

    async def _login_with_firebase_password(self, email: str, password: str) -> dict:
        response = requests.post(
            "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword",
            params={"key": self.settings.firebase_web_api_key},
            json={"email": email, "password": password, "returnSecureToken": True},
            timeout=10,
        )
        if response.status_code >= 400:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
        data = response.json()
        user = UserResponse(id=data["localId"], email=data["email"], display_name=data.get("displayName"))
        await self.log_service.create_log(
            LogCreateRequest(event="User Logged In", action="NONE", status="OK", details={"email": email})
        )
        return {"user": user.model_dump(), "idToken": data["idToken"], "refreshToken": data["refreshToken"]}

    async def _login_with_local_fallback(self, payload: LoginRequest) -> dict:
        if not self.settings.enable_local_auth_fallback:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Firebase login is not configured.")
        if not payload.email or not payload.password:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Email and password required.")

        document = await self.repository.find_one(self.collection, "email", payload.email)
        if document and document.get("password") is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Firebase email/password login needs FIREBASE_WEB_API_KEY in backend/.env, or use a Firebase id_token.",
            )
        if not document or document.get("password") != payload.password:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

        user = UserResponse(
            id=document["id"],
            email=document["email"],
            display_name=document.get("display_name"),
        )
        await self.log_service.create_log(
            LogCreateRequest(event="User Logged In", action="NONE", status="OK", details={"email": payload.email})
        )
        return {"user": user.model_dump(), "tokenType": "local-dev", "accessToken": document["id"]}
