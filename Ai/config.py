import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')


@dataclass
class Settings:
    api_key: str = os.getenv('AI_API_KEY', '')
    afferens_endpoint: str = os.getenv('AFFERENS_ENDPOINT', 'https://api.afferens.ai/v1/vision')
    port: int = int(os.getenv('PORT', '3000'))
    camera_index: int = int(os.getenv('CAMERA_INDEX', '0'))
    absence_timeout_seconds: int = int(os.getenv('ABSENCE_TIMEOUT_SECONDS', '15'))
    lock_on_absence: bool = os.getenv('LOCK_ON_ABSENCE', 'True').lower() in ('1', 'true', 'yes')
    mock_afferens: bool = os.getenv('MOCK_AFFERENS', 'False').lower() in ('1', 'true', 'yes')
    backend_detect_url: str = os.getenv('BACKEND_DETECT_URL', 'http://127.0.0.1:8080/detect')
    log_path: Path = BASE_DIR / 'activity.log'


settings = Settings()
