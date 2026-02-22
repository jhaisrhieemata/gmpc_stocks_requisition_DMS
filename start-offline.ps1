# GMPC Stocks Requisition DMS - Offline Startup Script (PowerShell)
# Run this script to start both backend and frontend servers

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " GMPC Stocks Requisition DMS - Offline" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if npm is installed
try {
    npm --version | Out-Null
} catch {
    Write-Host "ERROR: npm is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[1/4] Checking Node.js and npm..." -ForegroundColor Cyan
node --version
npm --version
Write-Host ""

Write-Host "[2/4] Starting backend server..." -ForegroundColor Cyan
$backendPath = "c:\xampp\htdocs\gmpc_stocks_requisition_DMS\server"
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm start"
Write-Host "Backend server starting... (Port 3000)" -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "[3/4] Starting frontend development server..." -ForegroundColor Cyan
$frontendPath = "c:\xampp\htdocs\gmpc_stocks_requisition_DMS"
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"
Write-Host "Frontend server starting... (Port 5173 or custom)" -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "[4/4] Services Status..." -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Services Status:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API:      http://localhost:3000" -ForegroundColor Green
Write-Host "Frontend:         http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "*** IMPORTANT: Ensure MySQL is running in XAMPP ***" -ForegroundColor Red
Write-Host ""
Write-Host "To access the system:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:5173 in your browser"
Write-Host "2. Both services are running offline"
Write-Host "3. Close either PowerShell window to stop that service"
Write-Host ""
Write-Host "======================================== " -ForegroundColor Green

Read-Host "Press Enter to keep windows open"
