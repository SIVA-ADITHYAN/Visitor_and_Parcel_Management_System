@echo off
echo Starting VPMS Production Deployment...

echo Stopping existing containers...
docker-compose down

echo Building and starting services...
docker-compose up --build -d

echo Waiting for services to start...
timeout /t 30

echo VPMS Production Deployed Successfully!
echo Application: http://localhost
echo API: http://localhost:3002
echo Database: localhost:3306

echo Checking service status...
docker-compose ps

pause