@echo off
echo 🚀 Deploying SK Bakers E-commerce to Netlify...
echo.

echo 📦 Building the application...
call npm run build

echo.
echo ✅ Build complete! Files ready for Netlify.
echo.
echo 📋 Next steps:
echo 1. Go to your Netlify dashboard
echo 2. Go to "Deploys" section
echo 3. Drag and drop the "dist" folder to deploy
echo 4. Or use "Trigger deploy" if connected to Git
echo.
echo 🎯 The _redirects file is included to fix 404 errors!
echo.
pause
