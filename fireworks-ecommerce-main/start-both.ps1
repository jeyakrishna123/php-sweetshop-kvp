# PowerShell script to start both frontend and backend servers
Write-Host "🚀 Starting E-commerce Application..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Function to start backend in new window
function Start-Backend {
    Write-Host "🔥 Starting Backend Server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\start-backend.ps1"
}

# Function to start frontend in new window  
function Start-Frontend {
    Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\start-frontend.ps1"
}

# Start both servers
Start-Backend
Start-Sleep -Seconds 3
Start-Frontend

Write-Host ""
Write-Host "✅ Both servers are starting..." -ForegroundColor Green
Write-Host "🔗 Backend will be available at: http://localhost:3001" -ForegroundColor Yellow
Write-Host "🔗 Frontend will be available at: http://localhost:5173" -ForegroundColor Yellow
Write-Host "🔗 Admin Panel: http://localhost:5173/admin-login" -ForegroundColor Magenta
Write-Host ""
Write-Host "🔐 Admin Credentials:" -ForegroundColor Cyan
Write-Host "   Email: admin1@shop.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "👤 Test User Credentials:" -ForegroundColor Cyan  
Write-Host "   Email: john.customer@example.com" -ForegroundColor White
Write-Host "   Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Application is ready!" -ForegroundColor Green
