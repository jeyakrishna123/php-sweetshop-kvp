@echo off
echo ========================================
echo   Starting PHP Backend Server
echo ========================================
echo.
echo Server will start on: http://localhost:8000
echo.
echo IMPORTANT: Keep this window OPEN!
echo Do NOT close this window or the backend will stop.
echo.
echo Press Ctrl+C to stop the server when done.
echo.
echo ========================================
echo.

cd /d "%~dp0"
php -S localhost:8000 -t php-backend/

pause
