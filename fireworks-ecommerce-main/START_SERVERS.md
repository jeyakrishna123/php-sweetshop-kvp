# 🚀 How to Start Your E-commerce Application

## Quick Start (PowerShell)

### Method 1: Manual Start (Recommended)

**Terminal 1 - Backend:**
```powershell
cd ecommerce-website\backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd ecommerce-website\ecommerce-frontend  
npm run dev
```

### Method 2: Using Batch Files
```powershell
cd ecommerce-website
.\start-both-servers.bat
```

### Method 3: PowerShell Script
```powershell
cd ecommerce-website
.\start-both-servers.ps1
```

## 🔧 Admin Panel Logout Issue - FIXED!

### What was causing the automatic logout:
1. **Aggressive token expiration** - 5 minute buffer was too strict
2. **Wrong redirect URL** - Admin users were redirected to `/login` instead of `/admin-login`
3. **Auto-refresh conflicts** - Token refresh was interfering with admin sessions
4. **Role validation issues** - Not checking for both 'admin' and 'superadmin' roles

### What I fixed:
✅ **Fixed axios interceptor** - Now redirects admin users to `/admin-login`  
✅ **Removed token expiration buffer** - No premature logouts  
✅ **Disabled auto-refresh for admins** - Prevents refresh conflicts  
✅ **Extended admin token expiration** - 30 days instead of 7 days  
✅ **Fixed role validation** - Supports both 'admin' and 'superadmin'  

## 🔐 Login Credentials

### Admin Users:
- **Email:** `admin1@shop.com`
- **Password:** `admin123`

### Regular Users:
- **Email:** `john.customer@example.com`  
- **Password:** `password123`

## 🎯 Testing the Fix

1. Start both servers (backend on :3001, frontend on :5173)
2. Go to `http://localhost:5173/admin-login`
3. Login with admin credentials
4. Navigate around the admin panel
5. The session should persist without automatic logouts!

## 📊 Server Status

- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:5173  
- **Admin Panel:** http://localhost:5173/admin-login

## 🔍 If Issues Persist

1. Clear browser localStorage: `localStorage.clear()`
2. Check browser console for errors
3. Verify both servers are running
4. Check that .env file exists in backend directory

## ✅ Database Status

- **Users:** 5 (3 regular + 2 admin)
- **Orders:** 40 (all properly linked)
- **Products:** 34 (all in stock)
- **Data Integrity:** 100% ✅

**The admin panel should now work without automatic logouts!** 🎉
