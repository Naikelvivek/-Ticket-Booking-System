@echo off
REM Run backend and frontend concurrently (Windows). Open two PowerShell windows if you prefer.

echo Starting backend...
start cmd /k "cd "%~dp0backend" && npm install && npm run dev"

echo Starting frontend...
start cmd /k "cd "%~dp0frontend" && npm install && npm start"

echo Launched backend and frontend in new terminals.
