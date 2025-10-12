@echo off
echo ========================================
echo Starting PHP Backend Server
echo ========================================
echo.
echo Server will run on: http://localhost:3001
echo Press Ctrl+C to stop the server
echo.
cd php-backend
php -S localhost:3001 router.php
