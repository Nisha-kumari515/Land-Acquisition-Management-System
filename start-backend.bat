@echo off
title BHOOMISETU Application Stack

echo Starting BHOOMISETU database and backend services...
cd backend

:: Start services in the background
docker compose up -d

echo.
echo ========================================================
echo Services are running in the background!
echo Showing logs... (Press Ctrl+C to stop viewing logs)
echo ========================================================
echo.

:: Follow logs
docker compose logs -f

:: Once the user presses Ctrl+C to exit the logs, the script might terminate, 
:: but if they press 'N' to "Terminate batch job?", it will continue and stop them.
echo.
echo Stopping services...
docker compose stop
echo Services stopped.
pause
