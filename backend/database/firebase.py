import json
from functools import lru_cache
from typing import Optional

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import Client

from backend.config.settings import get_settings


@lru_cache
def get_firestore_client() -> Optional[Client]:
    settings = get_settings()
    if not (settings.firebase_credentials_path or settings.firebase_credentials_json):
        return None

    if not firebase_admin._apps:
        if settings.firebase_credentials_json:
            cert = credentials.Certificate(json.loads(settings.firebase_credentials_json))
        else:
            cert = credentials.Certificate(settings.firebase_credentials_path)
        firebase_admin.initialize_app(cert, {"projectId": settings.firebase_project_id})

    return firestore.client()

