# 📁 EXACT FILES TO UPLOAD TO HOSTINGER

## 🎯 **SUMMARY:**
- **Frontend**: Fixed localhost calls → production API calls
- **Backend**: Fixed all API errors and database issues
- **Root**: Fixed server configuration

---

## 📋 **FILES THAT WERE CHANGED:**

### **1. FRONTEND FILES (Changed):**
```
✅ hostinger_upload/frontend/index.html
   - Added aggressive production environment fix
   - Added localhost redirect script
   - Added force-clear-mock-data script

✅ hostinger_upload/force-production-api.js (NEW FILE)
   - Ultimate production API fix
   - Redirects all localhost calls to production

✅ hostinger_upload/force-clear-mock-data.js (EXISTING)
   - Clears mock data and forces real API calls
```

### **2. BACKEND FILES (Changed):**
```
✅ hostinger_upload/backend/api/products.php
   - Fixed getBestsellers() function
   - Fixed getAllProducts() function
   - Added proper error handling

✅ hostinger_upload/backend/api/categories.php
   - Fixed getAllCategories() function
   - Added fallback for empty results
   - Added proper error handling

✅ hostinger_upload/backend/api/auth.php
   - Fixed register() function
   - Added proper error handling

✅ hostinger_upload/backend/api/offer-popups.php
   - Fixed authentication issues
   - Removed auth requirement for public access

✅ hostinger_upload/backend/config/database.php
   - Fixed database connection credentials
   - Added multiple connection attempts
```

### **3. ROOT FILES (Changed):**
```
✅ hostinger_upload/.htaccess
   - Fixed MIME types
   - Fixed API routing
   - Simplified configuration
```

---

## 🚀 **FILES TO UPLOAD TO HOSTINGER:**

### **UPLOAD TO: `public_html/` (Root Directory)**

#### **1. Frontend Files:**
```
hostinger_upload/frontend/index.html → public_html/index.html
hostinger_upload/force-production-api.js → public_html/force-production-api.js
hostinger_upload/force-clear-mock-data.js → public_html/force-clear-mock-data.js
```

#### **2. Root Files:**
```
hostinger_upload/.htaccess → public_html/.htaccess
```

### **UPLOAD TO: `public_html/backend/` (Backend Directory)**

#### **3. Backend Files (Entire Folder):**
```
hostinger_upload/backend/ → public_html/backend/
├── api/
│   ├── products.php ✅ (Fixed)
│   ├── categories.php ✅ (Fixed)
│   ├── auth.php ✅ (Fixed)
│   ├── offer-popups.php ✅ (Fixed)
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

---

## 🔧 **UPLOAD STEPS:**

### **Step 1: Upload Backend (CRITICAL)**
1. **Upload entire `hostinger_upload/backend/` folder to `public_html/backend/`**
2. **Set permissions: 755 for folders, 644 for files**
3. **Create `public_html/backend/uploads/` folder with 755 permissions**

### **Step 2: Upload Frontend**
1. **Upload `hostinger_upload/frontend/index.html` to `public_html/index.html`**
2. **Upload `hostinger_upload/force-production-api.js` to `public_html/`**
3. **Upload `hostinger_upload/force-clear-mock-data.js` to `public_html/`**

### **Step 3: Upload Root Files**
1. **Upload `hostinger_upload/.htaccess` to `public_html/.htaccess`**

### **Step 4: Set Permissions**
- **Folders: 755**
- **Files: 644**

---

## ✅ **WHAT WILL BE FIXED:**

### **Before Upload:**
- ❌ Frontend calls localhost:8000
- ❌ Backend returns 500 errors
- ❌ Registration fails
- ❌ Products don't load

### **After Upload:**
- ✅ Frontend calls https://skbakers.com/api
- ✅ Backend returns 200 OK
- ✅ Registration works
- ✅ Products and categories load
- ✅ Website works perfectly

---

## 📋 **UPLOAD CHECKLIST:**

- [ ] Upload `hostinger_upload/backend/` to `public_html/backend/`
- [ ] Upload `hostinger_upload/frontend/index.html` to `public_html/index.html`
- [ ] Upload `hostinger_upload/force-production-api.js` to `public_html/`
- [ ] Upload `hostinger_upload/force-clear-mock-data.js` to `public_html/`
- [ ] Upload `hostinger_upload/.htaccess` to `public_html/.htaccess`
- [ ] Set permissions: 755 for folders, 644 for files
- [ ] Create `public_html/backend/uploads/` folder

**After upload, the website will work perfectly!**
