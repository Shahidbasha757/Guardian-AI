from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    display_name: Optional[str] = Field(default=None, max_length=100)

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "demo@example.com",
                "password": "secret123",
                "display_name": "Demo User",
            }
        }
    }


class LoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    id_token: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "email": "demo@example.com",
                    "password": "secret123",
                    "id_token": None,
                },
                {
                    "email": None,
                    "password": None,
                    "id_token": "firebase-id-token-from-client",
                },
            ]
        }
    }


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    display_name: Optional[str] = None
