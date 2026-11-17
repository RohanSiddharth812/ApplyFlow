@echo off
title ApplyFlow - Backend Server
echo ================================================
echo   APPLYFLOW - AI-Powered Job Application Assistant
echo   Backend API Server (FastAPI + SQLite)
echo ================================================
echo.
echo Starting backend on http://127.0.0.1:8000 ...
echo Swagger UI: http://127.0.0.1:8000/docs
echo.
cd /d "%~dp0backend"
call .venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
