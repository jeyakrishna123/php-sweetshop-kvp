@echo off
echo ========================================
echo MongoDB to MySQL Migration Tool
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo Step 1: Installing dependencies...
echo.
call npm install
echo.

echo Step 2: Testing MongoDB connection...
echo.
call npm run test-connection
echo.

echo ========================================
echo Ready to migrate?
echo ========================================
echo.
echo This will:
echo   1. Connect to MongoDB
echo   2. Export all data
echo   3. Generate migrated-data.sql file
echo.
echo Press any key to start migration...
pause >nul

echo.
echo Step 3: Running migration...
echo.
call npm run migrate

echo.
echo ========================================
echo Migration Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Check migrated-data.sql file
echo   2. Import schema.sql to MySQL
echo   3. Import migrated-data.sql to MySQL
echo   4. Update PHP backend .env file
echo   5. Test your API
echo.
echo See MIGRATION_GUIDE.md for details
echo.
pause
