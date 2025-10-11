# FireworksHub E-commerce Setup Guide

## Quick Start with Batch Files

### Option 1: Start Both Servers (Recommended)
Double-click `start-both.bat` to start both frontend and backend servers automatically.

### Option 2: Start Servers Individually
- **Backend Only**: Double-click `start-backend.bat`
- **Frontend Only**: Double-click `start-frontend.bat`

## Manual Setup

### Backend Setup
```bash
cd ecommerce-website/backend
npm install
set JWT_SECRET=your-super-secret-jwt-key-12345
set NODE_ENV=development
set PORT=3001
node server.js
```

### Frontend Setup
```bash
cd ecommerce-website/ecommerce-frontend
npm install
npm run dev
```

## Access URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Admin Panel**: http://localhost:5173/admin

## Features
- ✅ Product Management
- ✅ Order Management with Bill Generation
- ✅ Email Sending (when configured)
- ✅ Admin Panel
- ✅ User Authentication
- ✅ Shopping Cart & Wishlist

## Email Configuration (Optional)
To enable email sending, create a `.env` file in the backend directory:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_NAME=Your Company Name
FROM_EMAIL=your-email@gmail.com
```

## Troubleshooting
- If servers don't start, make sure Node.js is installed
- Check that ports 3001 and 5173 are not in use
- Run `npm install` in both directories if dependencies are missing
