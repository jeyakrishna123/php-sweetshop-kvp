# 📋 SIMPLE UPLOAD CHECKLIST FOR HOSTINGER

## 🎯 **BEFORE YOU START - UPDATE PASSWORDS**

**Update these 2 files with your real Hostinger database password:**

1. **File:** `php-backend/config/config_production.php`
   - Find line 24: `define('DB_PASS', 'YOUR_ACTUAL_DATABASE_PASSWORD');`
   - Replace with your real password

2. **File:** `setup_hostinger_database.php`
   - Find line 11: `$password = 'YOUR_ACTUAL_DATABASE_PASSWORD';`
   - Replace with your real password

## 📁 **UPLOAD TO HOSTINGER - STEP BY STEP**

### **STEP 1: Login to Hostinger**
- Go to: `https://hpanel.hostinger.com`
- Click "File Manager"
- Navigate to `public_html` folder

### **STEP 2: Upload 3 Root Files**
Upload these files directly to `public_html/`:

- [ ] `.htaccess` → `public_html/.htaccess`
- [ ] `sk-bakers-logo.png` → `public_html/sk-bakers-logo.png`
- [ ] `setup_hostinger_database.php` → `public_html/setup_hostinger_database.php`

### **STEP 3: Create Backend Folder**
1. Create new folder called `backend` in `public_html/`
2. Upload ALL contents of `php-backend/` folder to `public_html/backend/`

### **STEP 4: Create Frontend Folder**
1. Create new folder called `frontend` in `public_html/`
2. Upload ALL contents of `dist/` folder to `public_html/frontend/`

## ⚙️ **AFTER UPLOAD - CONFIGURE SERVER**

### **STEP 5: Rename Config File**
- In `public_html/backend/config/`
- Rename `config_production.php` to `config.php`

### **STEP 6: Set Folder Permissions**
- Right-click `public_html/backend/uploads/` → Set to 755
- Right-click `public_html/backend/logs/` → Set to 755

### **STEP 7: Setup Database**
1. Visit: `https://skbakers.com/setup_hostinger_database.php`
2. Wait for success message
3. **DELETE** `setup_hostinger_database.php` after success

## 🧪 **TEST YOUR WEBSITE**

### **STEP 8: Test Everything**
- [ ] Website loads: `https://skbakers.com`
- [ ] Admin panel works: `https://skbakers.com/admin`
- [ ] Admin login: `admin@skbakers.com` / `admin123`
- [ ] User registration works
- [ ] Product browsing works
- [ ] Cart and checkout work

## 🎯 **FINAL RESULT**

Your website will be live at:
- **Frontend:** `https://skbakers.com`
- **Admin Panel:** `https://skbakers.com/admin`
- **Admin Login:** `admin@skbakers.com` / `admin123`

## 📞 **IF YOU GET STUCK**

1. **Check error logs:** `public_html/backend/logs/php-error.log`
2. **Verify file permissions:** Make sure uploads and logs folders have 755
3. **Check database connection:** Ensure password is correct
4. **Verify .htaccess:** Make sure it's uploaded correctly

**That's it! Your SK Bakers website will be live on Hostinger!** 🚀
