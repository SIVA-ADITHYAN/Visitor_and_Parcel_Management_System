@echo off
echo.
echo ========================================
echo    VPMS - Visitor & Parcel Management
echo         System Starting...
echo ========================================
echo.

echo [1/3] Starting Backend Server...
start "VPMS Backend" cmd /k "cd /d \"d:\Matrinmony Assignment\VPMS\backend\" && echo Backend Server Starting... && npm run dev"

echo [2/3] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo [3/3] Starting Frontend Server...
start "VPMS Frontend" cmd /k "cd /d \"d:\Matrinmony Assignment\VPMS\frontend\vpms-frontend\" && echo Frontend Server Starting... && npm start"

echo.
echo ========================================
echo    VPMS Application Started!
echo ========================================
echo.
echo Backend API: http://localhost:3001
echo Frontend UI: http://localhost:4200
echo.
echo Features:
echo - Modern UI/UX Design
echo - User Registration & Login
echo - Role-based Access Control
echo - Visitor Management
echo - Parcel Tracking
echo - Admin Dashboard
echo.
echo Instructions:
echo 1. Wait for both servers to start
echo 2. Open http://localhost:4200 in your browser
echo 3. Create a new account or login
echo 4. Enjoy the modern VPMS experience!
echo.
pause