# PowerShell script to start the backend server
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Navigate to backend directory
Set-Location "ecommerce-website\backend"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚙️  Creating .env file..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
}

Write-Host "🔥 Starting backend on http://localhost:3001..." -ForegroundColor Cyan
npm start
