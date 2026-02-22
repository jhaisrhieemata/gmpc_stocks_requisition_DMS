@echo off
REM GMPC Stocks Requisition DMS - Offline Startup Script
REM This script starts both backend and frontend servers

echo.
echo ========================================
echo  GMPC Stocks Requisition DMS - Offline
echo ========================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Checking Node.js and npm...
node --version
npm --version
echo.

echo [2/4] Starting backend server...
echo.
start cmd /k "cd /d c:\xampp\htdocs\gmpc_stocks_requisition_DMS\server && npm start"
echo Backend server started in new window (Port 3000)
timeout /t 3

echo [3/4] Starting frontend development server...
echo.
start cmd /k "cd /d c:\xampp\htdocs\gmpc_stocks_requisition_DMS && npm run dev"
echo Frontend server started in new window (Port 5173 or custom)
timeout /t 3

echo.
echo [4/4] Checking services...
echo.
echo ========================================
echo Services Status:
echo ========================================
echo.
echo Backend API:     http://localhost:3000
echo Frontend:        http://localhost:5173
echo.
echo *** IMPORTANT: Ensure MySQL is running in XAMPP ***
echo.
echo To access the system:
echo 1. Open http://localhost:5173 in your browser
echo 2. Both services are now running offline
echo 3. Close either command window to stop that service
echo.
echo ========================================
pause
