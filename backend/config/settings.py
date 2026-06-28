from functools import lru_cache
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Guardian AI Backend"
    app_version: str = "1.0.0"
    environment: str = "development"
    cors_origins_raw: str = Field(default="*", validation_alias="CORS_ORIGINS")

    firebase_project_id: Optional[str] = None
    firebase_credentials_path: Optional[str] = None
    firebase_credentials_json: Optional[str] = None
    firebase_web_api_key: Optional[str] = None
    ai_service_url: str = "http://127.0.0.1:3000"

    enable_local_auth_fallback: bool = True
    default_monitoring_active: bool = True

    model_config = SettingsConfigDict(
        env_file="backend/.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
