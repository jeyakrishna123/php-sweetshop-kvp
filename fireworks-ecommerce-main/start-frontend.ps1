# PowerShell script to start the frontend server
Write-Host "🚀 Starting Frontend Server..." -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# Navigate to frontend directory
Set-Location "ecommerce-website\ecommerce-frontend"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "🎨 Starting frontend on http://localhost:5173..." -ForegroundColor Cyan
npm run dev
