#!/usr/bin/env powershell
# Ticket Booking System - Windows PowerShell Quick Start
# Run this from the project root directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ticket Booking System - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "  1. Node.js v16+ installed"
Write-Host "  2. PostgreSQL running (user: postgres, password: admin)"
Write-Host "  3. pgcrypto extension enabled"
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js v16+" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✓ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Cyan
Write-Host ""

# Start backend
Write-Host "Starting Backend (http://localhost:5000)..." -ForegroundColor Green
$backendScript = {
    cd "$PSScriptRoot\backend"
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    npm install
    Write-Host "Starting backend dev server..." -ForegroundColor Cyan
    npm run dev
}
$backendJob = Start-Job -ScriptBlock $backendScript -Name "Backend"

# Wait for backend to be ready
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting Frontend (http://localhost:3000)..." -ForegroundColor Green
$frontendScript = {
    cd "$PSScriptRoot\frontend"
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
    Write-Host "Starting frontend dev server..." -ForegroundColor Cyan
    $env:REACT_APP_API_BASE_URL = 'http://localhost:5000/api'
    npm start
}
$frontendJob = Start-Job -ScriptBlock $frontendScript -Name "Frontend"

Write-Host ""
Write-Host "Services started in background:" -ForegroundColor Green
Write-Host "  - Backend: http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  Backend:  Get-Job -Name Backend | Receive-Job -Keep" -ForegroundColor Gray
Write-Host "  Frontend: Get-Job -Name Frontend | Receive-Job -Keep" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop services:" -ForegroundColor Yellow
Write-Host "  Stop-Job -Name Backend; Stop-Job -Name Frontend" -ForegroundColor Gray
Write-Host ""

# Keep script alive and show job status
while ($true) {
    Start-Sleep -Seconds 5
    $backendStatus = (Get-Job -Name Backend).State
    $frontendStatus = (Get-Job -Name Frontend).State
    
    if ($backendStatus -eq "Completed" -or $frontendStatus -eq "Completed") {
        Write-Host "⚠ A service has stopped. Check logs above." -ForegroundColor Yellow
    }
}
