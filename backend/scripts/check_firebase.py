from datetime import datetime, timezone

from backend.database.firebase import get_firestore_client


def main() -> None:
    client = get_firestore_client()
    if client is None:
        raise SystemExit(
            "Firebase is not configured. Set FIREBASE_PROJECT_ID and FIREBASE_CREDENTIALS_PATH "
            "or FIREBASE_CREDENTIALS_JSON in backend/.env."
        )

    document = {
        "event": "Firebase Connection Check",
        "action": "NONE",
        "status": "OK",
        "timestamp": datetime.now(timezone.utc),
        "details": {"source": "backend/scripts/check_firebase.py"},
    }
    client.collection("ActivityLogs").add(document)
    print("Firebase connected. Test ActivityLogs document written successfully.")


if __name__ == "__main__":
    main()

