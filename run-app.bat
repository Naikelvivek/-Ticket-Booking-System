@echo off
REM Ticket Booking System - Windows Quick Start Script

color 0A
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║   Ticket Booking System - Quick Start Helper              ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo Choose an option:
echo.
echo [1] Check Setup Status
echo [2] Start Backend Server (Terminal 1)
echo [3] Start Frontend Server (Terminal 2)
echo [4] Start Both Servers
echo [5] Open Documentation
echo [6] Exit
echo.

set /p choice="Enter choice [1-6]: "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto backend
if "%choice%"=="3" goto frontend
if "%choice%"=="4" goto both
if "%choice%"=="5" goto docs
if "%choice%"=="6" goto end
goto invalid

:setup
color 0A
cls
echo ╔═══════════════════════════════════════════════════════════╗
echo ║            Setup Verification                             ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Node.js installed
    node --version
) else (
    echo [✗] Node.js not found
    echo Install from: https://nodejs.org/
)
echo.

echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] npm installed
    npm --version
) else (
    echo [✗] npm not found
)
echo.

echo Checking Backend dependencies...
if exist "backend\node_modules" (
    echo [✓] Backend dependencies installed
) else (
    echo [✗] Backend dependencies NOT installed
    echo Run: cd backend ^&^& npm install
)
echo.

echo Checking Frontend dependencies...
if exist "frontend\node_modules" (
    echo [✓] Frontend dependencies installed
) else (
    echo [✗] Frontend dependencies NOT installed
    echo Run: cd frontend ^&^& npm install --legacy-peer-deps
)
echo.

echo Checking PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] PostgreSQL installed
    psql --version
) else (
    echo [✗] PostgreSQL NOT installed
    echo Install from: https://www.postgresql.org/download/windows/
    echo Or use Railway: https://railway.app/
    echo Or use Supabase: https://supabase.com/
)
echo.

echo Checking Configuration Files...
if exist "backend\.env" (
    echo [✓] backend\.env exists
) else (
    echo [✗] backend\.env NOT found
)

if exist "frontend\.env" (
    echo [✓] frontend\.env exists
) else (
    echo [✗] frontend\.env NOT found
)
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Next Steps:
echo  1. Ensure PostgreSQL is installed/configured
echo  2. Update backend\.env with DATABASE_URL
echo  3. Run option [4] to start both servers
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
goto menu

:backend
color 0C
cls
echo ╔═══════════════════════════════════════════════════════════╗
echo ║       Starting Backend Server (Terminal 1)                 ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo Location: %cd%\backend
echo.
echo Starting: npm run dev
echo.
echo Expected Output:
echo  - Server running on http://localhost:5000
echo  - Database connected
echo  - Swagger docs at http://localhost:5000/api-docs
echo.
echo Press any key to continue...
pause >nul
cd backend
call npm run dev
goto menu

:frontend
color 0E
cls
echo ╔═══════════════════════════════════════════════════════════╗
echo ║       Starting Frontend Server (Terminal 2)                ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo Location: %cd%\frontend
echo.
echo Starting: npm start
echo.
echo Expected Output:
echo  - Compiled successfully!
echo  - Local: http://localhost:3000
echo.
echo Press any key to continue...
pause >nul
cd frontend
call npm start
goto menu

:both
color 0B
cls
echo ╔═══════════════════════════════════════════════════════════╗
echo ║        Starting Both Servers (2 Windows)                   ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo This will open 2 new command windows for backend and frontend
echo.
echo Please wait...
echo.

REM Start backend in new window
start cmd /k "cd %cd%\backend && npm run dev"
echo [✓] Backend server window opened
timeout /t 2 /nobreak

REM Start frontend in new window
start cmd /k "cd %cd%\frontend && npm start"
echo [✓] Frontend server window opened
timeout /t 2 /nobreak

cls
color 0A
echo ╔═══════════════════════════════════════════════════════════╗
echo ║          Both Servers Starting!                            ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo [1] Backend Server
echo     Starting on: http://localhost:5000
echo     API Docs: http://localhost:5000/api-docs
echo.
echo [2] Frontend Server
echo     Starting on: http://localhost:3000
echo.
echo Wait 30 seconds for both to compile...
echo Then open your browser and visit: http://localhost:3000
echo.
echo Demo Credentials:
echo   Admin:  admin@example.com / admin123
echo   User:   user@example.com / user123
echo.
timeout /t 5 /nobreak
echo Opening browser...
start "" http://localhost:3000
goto menu

:docs
cls
color 0E
echo ╔═══════════════════════════════════════════════════════════╗
echo ║             Documentation Files                            ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo Important Files:
echo.
echo 1. INSTALLATION_COMPLETE.md     - Read this first!
echo 2. SETUP_INSTRUCTIONS.md        - Detailed setup guide
echo 3. QUICK_START.md               - Beginner's guide
echo 4. README.md                    - Project overview
echo 5. DEPLOYMENT.md                - Production deployment
echo 6. PROJECT_SUMMARY.md           - Feature checklist
echo.
echo Additional:
echo   - backend/README.md           - API documentation
echo   - backend/SYSTEM_DESIGN.md    - Architecture details
echo   - frontend/README.md          - React components
echo.

set /p openfile="Open a file? Enter number [1-6] or press Enter to skip: "

if "%openfile%"=="1" start notepad INSTALLATION_COMPLETE.md
if "%openfile%"=="2" start notepad SETUP_INSTRUCTIONS.md
if "%openfile%"=="3" start notepad QUICK_START.md
if "%openfile%"=="4" start notepad README.md
if "%openfile%"=="5" start notepad DEPLOYMENT.md
if "%openfile%"=="6" start notepad PROJECT_SUMMARY.md

goto menu

:invalid
color 0C
echo Invalid choice. Please try again.
timeout /t 2 /nobreak
goto menu

:menu
goto start

:end
color 07
cls
echo.
echo Thanks for using Ticket Booking System!
echo.
echo Next time, run this script and choose "Start Both Servers"
echo.
echo For help, read: INSTALLATION_COMPLETE.md
echo.
exit /b 0
