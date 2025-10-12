@echo off
echo ========================================
echo Installing Visual C++ Redistributable 2022
echo ========================================
echo.
echo This will download and install the required VC++ runtime.
echo.
echo Opening download in browser...
start https://aka.ms/vs/17/release/vc_redist.x64.exe
echo.
echo ========================================
echo INSTRUCTIONS:
echo ========================================
echo 1. Download will start in your browser
echo 2. Once downloaded, run vc_redist.x64.exe
echo 3. Choose "Repair" if already installed
echo 4. After installation, come back here and press any key
echo.
pause
echo.
echo Testing PHP now...
php --version
echo.
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! PHP is working!
    echo.
    echo Starting PHP backend server...
    cd php-backend
    start "PHP Backend Server - Port 3001" php -S localhost:3001
    echo.
    echo ✅ Backend server is running!
    echo 📍 URL: http://localhost:3001
    echo.
    echo To stop the server, close the "PHP Backend Server" window.
) else (
    echo ERROR: PHP still has issues.
    echo Please restart your computer after installing VC++ and try again.
)
echo.
pause
