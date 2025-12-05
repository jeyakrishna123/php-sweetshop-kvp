@echo off
echo ========================================
echo   SK Bakers Dashboard Fix
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Fixing database issues...
echo ========================================
php fix_dashboard_complete.php
echo.
echo.

echo Step 2: Starting backend server...
echo ========================================
echo.
echo Server will start on: http://localhost:8000
echo.
echo IMPORTANT: Keep this window OPEN!
echo.
echo Now open your browser and go to:
echo http://localhost:5173/admin
echo.
echo Press Ctrl+C to stop the server when done.
echo.
echo ========================================
echo.

php -S localhost:8000 -t php-backend/

pause
