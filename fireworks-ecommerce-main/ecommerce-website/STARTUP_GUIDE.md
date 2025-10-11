# 🚀 E-commerce Application Startup Guide

## ⚠️ **CRITICAL: Create Environment File First**

Before running the application, you MUST create a `.env` file in the `backend` folder:

1. Go to `ecommerce-website/backend/` folder
2. Copy `env.example` and rename it to `.env`
3. Update the following values in `.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
COOKIE_SECRET=your-cookie-secret-key-change-in-production
```

## 🚀 **Quick Start Options**

### Option 1: Fast Startup (Recommended)
- Double-click `start-fast.bat`
- This will start both backend and frontend automatically

### Option 2: Manual Startup
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd ecommerce-frontend
npm install
npm run dev
```

### Option 3: Node Script
```bash
node start-app.js
```

## 🌐 **Access URLs**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Admin Panel**: http://localhost:5173/admin
- **Health Check**: http://localhost:3001/health

## 🔑 **Default Admin Credentials**

- **Email**: admin@fireworkshub.com
- **Password**: Check `temp_password.txt` file

## ❌ **Common Issues & Fixes**

### Issue: "JWT_SECRET environment variable is not set"
**Fix**: Create `.env` file in backend folder with JWT_SECRET

### Issue: "Cannot find module"
**Fix**: Run `npm install` in both backend and frontend folders

### Issue: Port already in use
**Fix**: Close other applications using ports 3001 or 5173

### Issue: MongoDB connection failed
**Fix**: Install MongoDB or update MONGODB_URI in `.env`

## 🛠️ **Features Available**

✅ User Registration & Login  
✅ Product Browsing & Search  
✅ Shopping Cart Management  
✅ Order Processing  
✅ Payment Integration (Stripe)  
✅ Admin Panel  
✅ Responsive Design  
✅ Role-based Access Control  

## 📞 **Need Help?**

If you encounter issues:
1. Check the console output for error messages
2. Ensure `.env` file exists and has required values
3. Verify all dependencies are installed
4. Check if ports 3001 and 5173 are available
