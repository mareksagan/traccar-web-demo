@echo off
echo Starting Traccar Demo Environment...
echo.

:: Start mock server in background
start "Mock Server" cmd /c "node mock-server.js"

:: Wait for server to start
timeout /t 2 /nobreak > nul

:: Start frontend
echo Starting frontend...
npm run start
