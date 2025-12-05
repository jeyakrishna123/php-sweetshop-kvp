@echo off
echo 🚀 SK BAKERS - HOSTINGER DEPLOYMENT PREPARATION
echo ================================================

echo.
echo 📋 DEPLOYMENT CHECKLIST:
echo.

echo ✅ 1. Database Setup:
echo    - Database Name: u707629033_skbakers_001
echo    - Database User: u707629033_skbakers
echo    - Database Host: localhost
echo    - Password: [Update in config files]
echo.

echo ✅ 2. Files to Upload:
echo    - .htaccess → public_html/
echo    - sk-bakers-logo.png → public_html/
echo    - php-backend/ → public_html/backend/
echo    - frontend/build/ → public_html/frontend/
echo.

echo ✅ 3. Configuration Files to Update:
echo    - php-backend/config/config_production.php
echo    - setup_hostinger_database.php
echo.

echo 🔧 IMPORTANT: Update database password in these files:
echo    - php-backend/config/config_production.php
echo    - setup_hostinger_database.php
echo.

echo 📦 Building frontend for production...
cd fireworks-ecommerce-main\ecommerce-website\ecommerce-frontend
call npm run build

echo.
echo ✅ Frontend build completed!
echo.

echo 📁 DEPLOYMENT STRUCTURE:
echo public_html/
echo ├── .htaccess
echo ├── sk-bakers-logo.png
echo ├── backend/
echo │   ├── api/
echo │   ├── config/
echo │   │   └── config.php (rename from config_production.php)
echo │   └── includes/
echo └── frontend/
echo     ├── index.html
echo     └── static/
echo.

echo 🎯 NEXT STEPS:
echo 1. Update database password in config files
echo 2. Upload files to Hostinger using File Manager or FTP
echo 3. Run setup_hostinger_database.php on your server
echo 4. Test your website at https://skbakers.com
echo.

echo 📧 Admin Login:
echo Email: admin@skbakers.com
echo Password: admin123
echo.

echo 🚀 Your SK Bakers website is ready for deployment!
pause
