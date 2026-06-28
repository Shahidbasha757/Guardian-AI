# Guardian AI

Guardian AI is an intelligent workstation security system that uses computer vision and the Afferens API to provide real-world awareness to an AI agent.

The service continuously monitors user presence through a webcam and analyzes sensory information using AI-powered perception services. When the user leaves the workstation for a predefined period, Guardian AI can lock the computer, record activity, and stay in monitoring mode until the user returns.

## Architecture

Perception → Reasoning → Action

- **Physical Environment**
- **Webcam Input**
- **Afferens Vision API**
- **AI Decision Engine**
- **Security Action**

## Repository structure

- `Ai/app.py` — FastAPI service and orchestration
- `Ai/camera.py` — webcam capture helper
- `Ai/afferens_client.py` — Afferens API integration
- `Ai/detector.py` — decision and state tracking
- `Ai/config.py` — environment configuration
- `Ai/requirements.txt` — Python dependencies

## Setup

1. Open a terminal in the project root:
   ```powershell
   cd C:\Pyhsical_Perception_Challenge\Guardian-Ai
   ```
2. Create and activate the root virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```powershell
   pip install -r Ai\requirements.txt
   ```
4. Create a local `.env` file in the `Ai` folder with your Afferens credentials:
   ```powershell
   copy Ai\.env.example Ai\.env
   ```

## Configuration

`Ai/.env` should include:

```text
AI_API_KEY=your_afferens_api_key_here
AFFERENS_ENDPOINT=https://api.afferens.ai/v1/vision
PORT=3000
CAMERA_INDEX=0
ABSENCE_TIMEOUT_SECONDS=15
LOCK_ON_ABSENCE=True
```

## Run

```powershell
uvicorn app:app --host 0.0.0.0 --port 3000
```

## Start Full Application

Use the launcher from the project root:

```powershell
cd C:\Users\nikhi\OneDrive\Documents\GitHub\ACHIVERS
.\start-guardian.ps1
```

Or double-click:

```text
start-guardian.bat
```

This opens three separate server windows:

- AI service: `http://127.0.0.1:3000/docs`
- Backend API: `http://127.0.0.1:8080/docs`
- Frontend app: `http://127.0.0.1:5173`

Keep all three windows open while using the app.

To stop the app:

```powershell
.\stop-guardian.ps1
```

## Endpoints

- `GET /sense` — captures a webcam frame, sends it for analysis, and returns the current action
- `GET /status` — returns the current monitoring mode and last-seen timestamp

## Notes

- `Ai/.env` is ignored by Git.
- The current lock action works on Windows using the native workstation lock API.
- Adjust `AFFERENS_ENDPOINT` to match the actual Afferens Vision API endpoint.
