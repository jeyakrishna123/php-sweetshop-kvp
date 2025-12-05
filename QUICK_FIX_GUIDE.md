# 🚀 Quick Fix Guide - PHP Backend Server Issue

## ❌ Current Problem
```
PHP Warning: 'C:\WINDOWS\SYSTEM32\VCRUNTIME140.dll' 14.28 is not compatible
with this PHP build linked with 14.44
```

## ✅ Solution Steps

### Option 1: Fix Visual C++ Redistributables (RECOMMENDED)

#### Step 1: Run the Fix Script
```bash
fix-vcruntime.bat
```

This will:
1. Open the Microsoft download page
2. Guide you through installation
3. Verify PHP works
4. Start the backend server

#### Step 2: Manual Installation (if script doesn't work)
1. Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
2. Run the installer
3. Choose "Repair" if already installed, or "Install"
4. Restart your computer
5. Run: `start-php-backend.bat`

---

### Option 2: Use Compatible PHP Version

If the Visual C++ update doesn't work, download PHP 8.2:
1. Go to: https://windows.php.net/download/
2. Download: PHP 8.2 x64 Thread Safe
3. Extract to: `C:\php82`
4. Update your system PATH to use the new PHP
5. Run: `start-php-backend.bat`

---

### Option 3: Use XAMPP (Easiest)

1. Download XAMPP: https://www.apachefriends.org/
2. Install XAMPP
3. Copy `php-backend` folder to `C:\xampp\htdocs\`
4. Start Apache from XAMPP Control Panel
5. Access: http://localhost/php-backend

---

## 🔧 Quick Start Scripts Created

### 1. `fix-vcruntime.bat`
Automatically fixes the VCRUNTIME140.dll issue

### 2. `start-php-backend.bat`
Starts the PHP backend server on port 3001

---

## 📝 Verify Installation

After fixing, run:
```bash
php --version
```

Should show PHP version without errors.

Then start the server:
```bash
start-php-backend.bat
```

Access: http://localhost:3001

---

## 🔍 Testing the Backend

Once running, test the API:
- Root: http://localhost:3001
- Health: http://localhost:3001/api/health
- Products: http://localhost:3001/api/products

---

## 🆘 Still Having Issues?

1. Check if MySQL is running (required for backend)
2. Verify database configuration in `php-backend/config/config.php`
3. Check firewall settings for port 3001
4. Try using XAMPP (Option 3) as fallback

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ PHP version shows without errors
- ✅ Server starts on port 3001
- ✅ http://localhost:3001 returns API info
- ✅ No VCRUNTIME140.dll errors

---

## 📞 Next Steps After Fix

1. ✅ Start PHP Backend (port 3001)
2. ✅ Verify MySQL database connection
3. ✅ Test API endpoints
4. ✅ Connect frontend to backend
5. ✅ Test full application flow
