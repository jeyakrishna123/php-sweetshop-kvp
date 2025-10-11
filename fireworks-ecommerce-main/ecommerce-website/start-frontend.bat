@echo off
echo Starting FireworksHub Frontend Server...
echo.

cd /d "%~dp0ecommerce-frontend"

echo Installing dependencies if needed...
call npm install

echo.
echo Starting frontend development server on port 5173...
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
