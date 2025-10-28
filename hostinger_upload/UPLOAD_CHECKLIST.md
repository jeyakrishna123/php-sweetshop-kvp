# 🚀 HOSTINGER UPLOAD CHECKLIST

## ❌ **CURRENT ISSUE:**
- Frontend is calling `https://skbakers.com/api` ✅ (Fixed)
- Backend APIs returning **500 Internal Server Error** ❌ (Need to fix)

## 📁 **FILES TO UPLOAD TO HOSTINGER:**

### **1. Backend Files (CRITICAL - Upload to `public_html/backend/`):**
```
hostinger_upload/backend/ (entire folder)
├── api/
│   ├── products.php ✅ (Fixed)
│   ├── categories.php
│   ├── auth.php
│   ├── orders.php
│   └── banners.php
├── config/
│   ├── database.php ✅ (Fixed)
│   └── config.php
├── includes/
│   └── helpers.php
├── middleware/
│   ├── auth.php
│   └── cors.php
└── uploads/ (create this folder)
```

### **2. Frontend Files (Upload to `public_html/`):**
```
hostinger_upload/frontend/index.html → public_html/index.html
hostinger_upload/force-production-api.js → public_html/
hostinger_upload/force-clear-mock-data.js → public_html/
```

### **3. Root Files (Upload to `public_html/`):**
```
hostinger_upload/.htaccess → public_html/.htaccess
```

## 🔧 **UPLOAD STEPS:**

### **Step 1: Upload Backend (CRITICAL)**
1. Upload entire `hostinger_upload/backend/` folder to `public_html/backend/`
2. Set permissions: 755 for folders, 644 for files
3. Create `public_html/backend/uploads/` folder with 755 permissions

### **Step 2: Upload Frontend**
1. Upload `hostinger_upload/frontend/index.html` to `public_html/index.html`
2. Upload `hostinger_upload/force-production-api.js` to `public_html/`
3. Upload `hostinger_upload/force-clear-mock-data.js` to `public_html/`

### **Step 3: Upload Root Files**
1. Upload `hostinger_upload/.htaccess` to `public_html/.htaccess`

### **Step 4: Test**
1. Visit `https://skbakers.com`
2. Check browser console - should show production API calls
3. Run `https://skbakers.com/COMPLETE_BACKEND_FIX.php` to test APIs

## ✅ **EXPECTED RESULT:**
- ✅ Frontend calls `https://skbakers.com/api` (not localhost)
- ✅ Backend APIs return 200 OK (not 500 errors)
- ✅ Products and categories load properly
- ✅ Signup/login works with production API

## 🚨 **IF STILL NOT WORKING:**
1. Check file permissions (755 for folders, 644 for files)
2. Verify `.htaccess` is uploaded correctly
3. Check Hostinger error logs
4. Run `COMPLETE_BACKEND_FIX.php` to diagnose issues
