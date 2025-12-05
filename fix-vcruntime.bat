@echo off
echo ========================================
echo Fixing VCRUNTIME140.dll Compatibility Issue
echo ========================================
echo.
echo Current Issue: PHP requires VCRUNTIME140.dll v14.44
echo Your System has: VCRUNTIME140.dll v14.28
echo.
echo ========================================
echo STEP 1: Download Visual C++ Redistributable
echo ========================================
echo.
echo Opening download page in your browser...
echo Please download and install: vc_redist.x64.exe
echo.
start https://aka.ms/vs/17/release/vc_redist.x64.exe
echo.
echo ========================================
echo STEP 2: Installation Instructions
echo ========================================
echo.
echo 1. Once downloaded, run vc_redist.x64.exe
echo 2. If already installed, choose "Repair"
echo 3. If not installed, choose "Install"
echo 4. Complete the installation
echo 5. Press any key here to continue...
echo.
pause
echo.
echo ========================================
echo STEP 3: Verifying PHP Installation
echo ========================================
echo.
php --version
echo.
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! PHP is now working correctly.
    echo.
    echo ========================================
    echo STEP 4: Starting PHP Backend Server
    echo ========================================
    echo.
    echo Starting PHP built-in server on port 3001...
    cd php-backend
    start "PHP Backend Server" php -S localhost:3001
    echo.
    echo Server started! You can access it at: http://localhost:3001
    echo.
    echo To stop the server, close the PHP Backend Server window.
) else (
    echo.
    echo ERROR: PHP still has issues.
    echo.
    echo ALTERNATIVE SOLUTION:
    echo If the issue persists, you may need to:
    echo 1. Download PHP 8.2 (compatible with VC++ 14.28)
    echo 2. Or manually update VCRUNTIME140.dll in C:\WINDOWS\SYSTEM32\
    echo.
    echo Would you like help with the alternative solution?
)
echo.
pause
