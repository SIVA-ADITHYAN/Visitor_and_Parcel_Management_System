@echo off
echo Starting VPMS Deployment...

echo Building Backend...
cd backend
call npm install
call npm run build
cd ..

echo Building Frontend...
cd frontend\vpms-frontend
call npm install
call npm run build
cd ..\..

echo Starting Services...
start "VPMS Backend" cmd /k "cd backend && npm start"
timeout /t 5
start "VPMS Frontend" cmd /k "cd frontend\vpms-frontend && npm start"

echo VPMS Deployed Successfully!
echo Backend: http://localhost:3002
echo Frontend: http://localhost:4200
pause