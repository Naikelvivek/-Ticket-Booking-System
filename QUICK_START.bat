@echo off
REM ========================================
REM Ticket Booking System - Windows Quick Start
REM ========================================
REM This script starts both backend and frontend
REM Make sure you have:
REM   1. Node.js v16+ installed
REM   2. PostgreSQL running with user postgres / password admin
REM   3. pgcrypto extension enabled (CREATE EXTENSION pgcrypto;)
REM ========================================

echo.
echo Starting Ticket Booking System...
echo.
echo Terminal 1 will start Backend (port 5000)
echo Terminal 2 will start Frontend (port 3000)
echo.

cd /d "%~dp0"

REM Start backend in new window
start cmd /k "cd backend && npm install && npm run dev"

REM Wait a bit for backend to initialize
timeout /t 3

REM Start frontend in new window
start cmd /k "cd frontend && npm install && npm start"

echo.
echo Servers launching...
echo - Backend: http://localhost:5000/api
echo - Frontend: http://localhost:3000
echo.
echo You can close this window. The backend and frontend will continue running.
echo.

pause
