@echo off
echo Starting FireworksHub Backend Server...
echo.

cd /d "%~dp0backend"

echo Setting environment variables...
set JWT_SECRET=your-super-secret-jwt-key-12345
set NODE_ENV=development
set PORT=3001
set SMTP_HOST=smtp.hostinger.com
set SMTP_PORT=587
set SMTP_EMAIL=info@upgradenow.in
set SMTP_PASSWORD=Ravi@0056
set FROM_NAME=UpgradeNow Technologies
set FROM_EMAIL=info@upgradenow.in

echo Installing dependencies if needed...
call npm install

echo.
echo Starting backend server on port 3001...
echo Press Ctrl+C to stop the server
echo.

node server.js

pause
