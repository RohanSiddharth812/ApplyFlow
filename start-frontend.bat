@echo off
title ApplyFlow - Frontend Dev Server
echo ================================================
echo   APPLYFLOW - AI-Powered Job Application Assistant
echo   Frontend Dev Server (Vite + React + TypeScript)
echo ================================================
echo.
echo Starting frontend on http://127.0.0.1:5173 ...
echo.
cd /d "%~dp0frontend"
npm run dev -- --host 127.0.0.1 --port 5173
