@echo off
echo ========================================
echo Starting PHP Backend Server
echo ========================================
echo.
echo Server will run on: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
cd php-backend
php -S localhost:8000 router.php
