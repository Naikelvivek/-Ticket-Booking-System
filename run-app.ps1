#!/usr/bin/env pwsh

# Ticket Booking System - Easy Start Script
# This script helps set up and run the application

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("setup", "start", "backend", "frontend", "help")]
    [string]$Command = "help"
)

$ProjectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendPath = Join-Path $ProjectPath "backend"
$FrontendPath = Join-Path $ProjectPath "frontend"

function Show-Help {
    Write-Host "
╔════════════════════════════════════════════════════════════════╗
║        Ticket Booking System - Quick Start Helper               ║
╚════════════════════════════════════════════════════════════════╝

Usage: pwsh run-app.ps1 -Command <command>

Commands:
  setup      - Verify setup and show next steps
  start      - Start both backend and frontend servers
  backend    - Start only backend server
  frontend   - Start only frontend server
  help       - Show this help message

Examples:
  pwsh run-app.ps1 -Command setup
  pwsh run-app.ps1 -Command start
  pwsh run-app.ps1 -Command backend

Prerequisites:
  ✓ Node.js 16+ (Installed)
  ✓ npm (Installed with Node.js)
  ✗ PostgreSQL 12+ (Required - NOT installed yet)

Next Steps:
  1. Install PostgreSQL or use Railway/Supabase
  2. Update backend/.env with database URL
  3. Run: pwsh run-app.ps1 -Command start

For detailed instructions, read:
  - SETUP_INSTRUCTIONS.md
  - QUICK_START.md
  - README.md

" -ForegroundColor Cyan
}

function Show-Setup {
    Write-Host "
╔════════════════════════════════════════════════════════════════╗
║                    Setup Verification                          ║
╚════════════════════════════════════════════════════════════════╝
" -ForegroundColor Green

    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "✗ Node.js not found" -ForegroundColor Red
        Write-Host "  Install from: https://nodejs.org/" -ForegroundColor Yellow
        return
    }

    # Check npm
    try {
        $npmVersion = npm --version 2>$null
        Write-Host "✓ npm $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "✗ npm not found" -ForegroundColor Red
        return
    }

    # Check backend dependencies
    if (Test-Path "$BackendPath/node_modules") {
        Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Backend dependencies not installed" -ForegroundColor Red
        Write-Host "  Run: cd backend && npm install" -ForegroundColor Yellow
    }

    # Check frontend dependencies
    if (Test-Path "$FrontendPath/node_modules") {
        Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Frontend dependencies not installed" -ForegroundColor Red
        Write-Host "  Run: cd frontend && npm install --legacy-peer-deps" -ForegroundColor Yellow
    }

    # Check PostgreSQL
    try {
        psql --version 2>$null | Out-Null
        Write-Host "✓ PostgreSQL installed" -ForegroundColor Green
    } catch {
        Write-Host "✗ PostgreSQL not installed" -ForegroundColor Red
        Write-Host "  Install from: https://www.postgresql.org/download/" -ForegroundColor Yellow
        Write-Host "  Or use Railway: https://railway.app/" -ForegroundColor Yellow
        Write-Host "  Or use Supabase: https://supabase.com/" -ForegroundColor Yellow
    }

    # Check .env files
    $backendEnv = "$BackendPath/.env"
    $frontendEnv = "$FrontendPath/.env"

    if (Test-Path $backendEnv) {
        $content = Get-Content $backendEnv -Raw
        if ($content -contains "YOUR_PASSWORD" -or $content -contains "localhost") {
            Write-Host "⚠ Backend .env needs configuration" -ForegroundColor Yellow
            Write-Host "  Edit: backend/.env" -ForegroundColor Yellow
        } else {
            Write-Host "✓ Backend .env configured" -ForegroundColor Green
        }
    } else {
        Write-Host "✗ Backend .env not found" -ForegroundColor Red
    }

    if (Test-Path $frontendEnv) {
        Write-Host "✓ Frontend .env exists" -ForegroundColor Green
    } else {
        Write-Host "⚠ Frontend .env might need configuration" -ForegroundColor Yellow
    }

    Write-Host "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Next Steps:
  1. Install/configure PostgreSQL
  2. Update backend/.env with database URL
  3. Run: pwsh run-app.ps1 -Command start

Documentation:
  - Read SETUP_INSTRUCTIONS.md for detailed setup
  - Read QUICK_START.md for usage guide
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
" -ForegroundColor Cyan
}

function Start-Servers {
    Write-Host "
╔════════════════════════════════════════════════════════════════╗
║               Starting Servers (2 Terminals Needed)             ║
╚════════════════════════════════════════════════════════════════╝
" -ForegroundColor Green

    Write-Host "
You need to open 2 terminal windows (or tabs).

Terminal 1 - Backend Server:
  cd ""$BackendPath""
  npm run dev

Terminal 2 - Frontend Server:
  cd ""$FrontendPath""
  npm start

Access Points (after both start):
  • Frontend: http://localhost:3000
  • API Docs: http://localhost:5000/api-docs
  • API: http://localhost:5000/api

Demo Credentials:
  Admin:  admin@example.com / admin123
  User:   user@example.com / user123
" -ForegroundColor Cyan

    # Offer to open terminals
    $response = Read-Host "Open PowerShell windows for both servers? (y/n)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Opening Terminal 1 (Backend)..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; npm run dev"
        
        Start-Sleep -Seconds 2
        
        Write-Host "Opening Terminal 2 (Frontend)..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendPath'; npm start"
        
        Write-Host "
✓ Servers starting in new windows
✓ Check Terminal 1 for backend status
✓ Check Terminal 2 for frontend status
✓ Visit http://localhost:3000 when both are ready
" -ForegroundColor Green
    } else {
        Write-Host "Manual startup required. See instructions above." -ForegroundColor Yellow
    }
}

function Start-Backend {
    Write-Host "Starting Backend Server..." -ForegroundColor Green
    Write-Host "Location: $BackendPath" -ForegroundColor Cyan
    
    Set-Location $BackendPath
    npm run dev
}

function Start-Frontend {
    Write-Host "Starting Frontend Server..." -ForegroundColor Green
    Write-Host "Location: $FrontendPath" -ForegroundColor Cyan
    
    Set-Location $FrontendPath
    npm start
}

# Main execution
switch ($Command) {
    "help" { Show-Help }
    "setup" { Show-Setup }
    "start" { Start-Servers }
    "backend" { Start-Backend }
    "frontend" { Start-Frontend }
    default { Show-Help }
}
