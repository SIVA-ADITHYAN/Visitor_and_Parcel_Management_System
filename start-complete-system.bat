@echo off
echo ========================================
echo    VPMS - Complete System Startup
echo ========================================
echo.

echo [1/4] Checking MySQL Service...
sc query MySQL80 | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo MySQL is not running. Please start MySQL service manually.
    echo Run: net start MySQL80 (as Administrator)
    pause
    exit /b 1
)
echo MySQL is running ✓

echo.
echo [2/4] Starting Backend Server...
start "VPMS Backend" cmd /k "cd /d \"d:\Matrinmony Assignment\VPMS\backend\" && echo Starting Backend... && npm run dev"

echo.
echo [3/4] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Starting Frontend Server...
start "VPMS Frontend" cmd /k "cd /d \"d:\Matrinmony Assignment\VPMS\frontend\vpms-frontend\" && echo Starting Frontend... && npm start"

echo.
echo ========================================
echo    VPMS System Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:3002
echo Frontend UI: http://localhost:4200
echo Database: MySQL (localhost:3306)
echo.
echo Test Accounts:
echo - Create new accounts via signup
echo - Different roles: Admin, Security Guard, Resident
echo.
echo Troubleshooting:
echo - If backend fails: Check MySQL is running
echo - If frontend fails: Check port 4200 is free
echo - Database issues: Check .env file credentials
echo.
pause