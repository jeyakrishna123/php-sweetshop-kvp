# 🚀 HOSTINGER UPLOAD GUIDE - CLEAR & EASY

## 📁 **EXACT FILE STRUCTURE FOR HOSTINGER**

### **Your Local Files → Hostinger Server**

```
YOUR LOCAL COMPUTER                    →    HOSTINGER SERVER
=====================================     ===================
C:\Users\jeyakrishna\Documents\php-sweetshop-kvp\
├── .htaccess                          →    public_html/.htaccess
├── sk-bakers-logo.png                 →    public_html/sk-bakers-logo.png
├── setup_hostinger_database.php      →    public_html/setup_hostinger_database.php
├── php-backend/                       →    public_html/backend/
│   ├── api/                          →    public_html/backend/api/
│   ├── config/                       →    public_html/backend/config/
│   ├── includes/                     →    public_html/backend/includes/
│   ├── middleware/                    →    public_html/backend/middleware/
│   ├── database/                     →    public_html/backend/database/
│   ├── uploads/                      →    public_html/backend/uploads/
│   └── logs/                         →    public_html/backend/logs/
└── fireworks-ecommerce-main/ecommerce-website/ecommerce-frontend/dist/
    ├── index.html                    →    public_html/frontend/index.html
    ├── assets/                       →    public_html/frontend/assets/
    ├── sk-bakers-logo.png           →    public_html/frontend/sk-bakers-logo.png
    └── manifest.json                 →    public_html/frontend/manifest.json
```

## 🎯 **STEP-BY-STEP UPLOAD INSTRUCTIONS**

### **STEP 1: LOGIN TO HOSTINGER**
1. Go to: `https://hpanel.hostinger.com`
2. Login with your credentials
3. Click "File Manager"
4. Navigate to `public_html` folder

### **STEP 2: UPLOAD ROOT FILES**
**Upload these 3 files directly to `public_html/`:**

1. **`.htaccess`**
   - Source: `C:\Users\jeyakrishna\Documents\php-sweetshop-kvp\.htaccess`
   - Destination: `public_html/.htaccess`

2. **`sk-bakers-logo.png`**
   - Source: `C:\Users\jeyakrishna\Documents\php-sweetshop-kvp\sk-bakers-logo.png`
   - Destination: `public_html/sk-bakers-logo.png`

3. **`setup_hostinger_database.php`**
   - Source: `C:\Users\jeyakrishna\Documents\php-sweetshop-kvp\setup_hostinger_database.php`
   - Destination: `public_html/setup_hostinger_database.php`

### **STEP 3: CREATE BACKEND FOLDER**
1. In File Manager, create a new folder called `backend`
2. Upload the **ENTIRE** `php-backend` folder contents to `public_html/backend/`

**What to upload:**
- Select ALL files and folders inside `C:\Users\jeyakrishna\Documents\php-sweetshop-kvp\php-backend\`
- Upload them to `public_html/backend/`

### **STEP 4: CREATE FRONTEND FOLDER**
1. In File Manager, create a new folder called `frontend`
2. Upload the **ENTIRE** `dist` folder contents to `public_html/frontend/`

**What to upload:**
- Select ALL files and folders inside `C:\Users\jeyakrishna\Documents\php-sweetshop-kvp\fireworks-ecommerce-main\ecommerce-website\ecommerce-frontend\dist\`
- Upload them to `public_html/frontend/`

## 📋 **FINAL HOSTINGER STRUCTURE**

After upload, your `public_html/` should look like this:

```
public_html/
├── .htaccess
├── sk-bakers-logo.png
├── setup_hostinger_database.php
├── backend/
│   ├── api/
│   ├── config/
│   ├── includes/
│   ├── middleware/
│   ├── database/
│   ├── uploads/
│   └── logs/
└── frontend/
    ├── index.html
    ├── assets/
    ├── sk-bakers-logo.png
    └── manifest.json
```

## ⚠️ **IMPORTANT NOTES**

### **Before Uploading:**
1. **Update Database Password** in these 2 files:
   - `php-backend/config/config_production.php` (line 24)
   - `setup_hostinger_database.php` (line 11)
   - Replace `YOUR_ACTUAL_DATABASE_PASSWORD` with your real password

### **After Uploading:**
1. **Rename config file:**
   - In `public_html/backend/config/`
   - Rename `config_production.php` to `config.php`

2. **Set permissions:**
   - `public_html/backend/uploads/` → 755
   - `public_html/backend/logs/` → 755

3. **Run database setup:**
   - Visit: `https://skbakers.com/setup_hostinger_database.php`
   - Delete this file after successful setup

## 🎯 **QUICK UPLOAD CHECKLIST**

- [ ] Upload `.htaccess` to `public_html/`
- [ ] Upload `sk-bakers-logo.png` to `public_html/`
- [ ] Upload `setup_hostinger_database.php` to `public_html/`
- [ ] Create `backend` folder in `public_html/`
- [ ] Upload `php-backend/` contents to `public_html/backend/`
- [ ] Create `frontend` folder in `public_html/`
- [ ] Upload `dist/` contents to `public_html/frontend/`
- [ ] Update database passwords
- [ ] Rename `config_production.php` to `config.php`
- [ ] Set folder permissions
- [ ] Run database setup
- [ ] Test website

## 🚀 **YOUR WEBSITE WILL BE LIVE AT:**
- **Frontend:** `https://skbakers.com`
- **Admin Panel:** `https://skbakers.com/admin`
- **Admin Login:** `admin@skbakers.com` / `admin123`
