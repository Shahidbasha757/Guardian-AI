# Guardian AI Backend

FastAPI backend for the Guardian AI perception -> reasoning -> action loop.

## What It Does

- Receives AI detection events through `POST /detect`
- Decides whether to return `NONE` or `LOCK`
- Stores activity logs
- Maintains current monitoring status
- Provides register/login endpoints
- Uses Firebase Firestore/Auth when configured
- Falls back to local in-memory storage for hackathon demos and Swagger testing

## Run Locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

Open Swagger UI:

```text
http://127.0.0.1:8000/docs
```

If you run from inside the `backend` directory and imports fail, run from the repository root instead:

```bash
uvicorn backend.main:app --reload
```

## API Response Shape

All endpoints return:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Failures return:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Main Endpoints

- `GET /`
- `GET /health`
- `POST /register`
- `POST /login`
- `POST /detect`
- `GET /status`
- `GET /logs`
- `POST /logs`

## Login In Swagger

For the local hackathon demo, register first:

```json
{
  "email": "demo@example.com",
  "password": "secret123",
  "display_name": "Demo User"
}
```

Then login with email/password and leave `id_token` empty:

```json
{
  "email": "demo@example.com",
  "password": "secret123"
}
```

Only use `id_token` when a frontend has already signed in with Firebase and is sending a real Firebase ID token.

## Detection Example

```json
{
  "personDetected": true,
  "confidence": 98.5,
  "timestamp": "2026-06-27T10:00:00Z"
}
```

When `personDetected` is `true`, the backend returns:

```json
{
  "action": "NONE"
}
```

When `personDetected` is `false`, the backend stores alert logs and returns:

```json
{
  "action": "LOCK"
}
```

## Firebase Setup

Copy `.env.example` to `.env` and fill in Firebase values.

Use either:

- `FIREBASE_CREDENTIALS_PATH` pointing to a service account JSON file
- `FIREBASE_CREDENTIALS_JSON` containing the service account JSON

Set `FIREBASE_WEB_API_KEY` if you want `POST /login` to accept email/password through Firebase's REST API. Without it, `POST /login` accepts a Firebase `id_token`, or uses the local demo fallback when enabled.

Check the connection:

```bash
python -m backend.scripts.check_firebase
```

If Firebase is connected, the script writes one test document into the `ActivityLogs` collection.

## Notes For Teams

The backend does not run computer vision and does not execute OS-specific lock commands. It only decides the action and records the event. The AI module and any device agent can execute actions based on the API response.
