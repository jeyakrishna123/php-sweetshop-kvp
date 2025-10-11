@echo off
echo Starting Admin Server...
echo.

cd /d "%~dp0"

echo Installing dependencies...
npm install

echo.
echo Starting server on port 3001...
echo.

node simple-admin-server.js

pause
