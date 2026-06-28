$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = Join-Path $Root "backend\.venv\Scripts\python.exe"

if (!(Test-Path $Python)) {
    Write-Host "Python venv not found at $Python" -ForegroundColor Red
    Write-Host "Create it first, then install backend requirements."
    exit 1
}

if (!(Test-Path (Join-Path $Root "frontend\node_modules"))) {
    Write-Host "frontend\node_modules not found. Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location (Join-Path $Root "frontend")
    & npm.cmd install
    Pop-Location
}

Write-Host "Starting Guardian AI services..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command",
    "cd `"$Root`"; `"$Python`" -m uvicorn Ai.app:app --host 127.0.0.1 --port 3000"
)

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command",
    "cd `"$Root`"; `"$Python`" -m uvicorn backend.main:app --host 127.0.0.1 --port 8080"
)

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command",
    "cd `"$Root\frontend`"; npm.cmd run dev -- --host 127.0.0.1 --port 5173"
)

Write-Host ""
Write-Host "Opened 3 server windows. Keep them open." -ForegroundColor Green
Write-Host "AI:       http://127.0.0.1:3000/docs"
Write-Host "Backend:  http://127.0.0.1:8080/docs"
Write-Host "Frontend: http://127.0.0.1:5173"

