@echo off
echo 🚀 Building SK Bakers Frontend for Production...

cd fireworks-ecommerce-main\ecommerce-website\ecommerce-frontend

echo 📦 Installing dependencies...
call npm install

echo 🔨 Building production version...
call npm run build

echo ✅ Frontend build completed!
echo 📁 Build files are in: fireworks-ecommerce-main\ecommerce-website\ecommerce-frontend\build

echo.
echo 📋 Next steps:
echo 1. Upload the 'build' folder contents to public_html/frontend/
echo 2. Upload php-backend folder to public_html/backend/
echo 3. Upload .htaccess to public_html/
echo 4. Run setup_hostinger_database.php on your server

pause
