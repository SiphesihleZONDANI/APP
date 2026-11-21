@echo off
title SafeHer - Mobile Women Safety App Server
echo ===================================================
echo   Starting SafeHer Unified Server on Port 3001
echo   Mock Police CAD Gateway: ACTIVE (Simulation)
echo ===================================================
echo.
cd /d "%~dp0"
node server/index.js
pause
