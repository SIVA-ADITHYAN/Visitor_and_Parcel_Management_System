@echo off
echo Starting VPMS Application...
echo.
echo Starting Backend Server...
start "VPMS Backend" cmd /k "cd /d \"d:\Matrinmony Assignment\VPMS\backend\" && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "VPMS Frontend" cmd /k "cd /d \"d:\Matrinmony Assignment\VPMS\frontend\vpms-frontend\" && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:4200
echo.
pause