@echo off
echo Setting up VPMS Environment...

echo Installing Backend Dependencies...
cd backend
call npm install
cd ..

echo Installing Frontend Dependencies...
cd frontend\vpms-frontend
call npm install
cd ..\..

echo Creating uploads directory...
if not exist "backend\uploads" mkdir backend\uploads

echo Environment setup complete!
echo Run 'deploy.bat' for development or 'deploy-production.bat' for production
pause