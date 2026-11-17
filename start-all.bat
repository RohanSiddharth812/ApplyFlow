@echo off
title ApplyFlow - Full Stack Launch
echo ================================================
echo   APPLYFLOW - AI-Powered Job Application Assistant
echo   Launching Backend + Frontend in separate windows
echo ================================================
echo.

start "ApplyFlow Backend" cmd /k "cd /d "%~dp0backend" && call .venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak > nul

start "ApplyFlow Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Both servers are starting...
echo   Backend  ->  http://127.0.0.1:8000
echo   Frontend ->  http://127.0.0.1:5173
echo   API Docs ->  http://127.0.0.1:8000/docs
echo.
timeout /t 5 /nobreak > nul
start "" "http://127.0.0.1:5173"
