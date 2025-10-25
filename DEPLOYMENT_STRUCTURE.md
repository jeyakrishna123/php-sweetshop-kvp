# 📁 HOSTINGER DEPLOYMENT STRUCTURE

## 🎯 **FILES TO UPLOAD TO HOSTINGER**

### **📂 Directory Structure on Hostinger:**
```
public_html/
├── .htaccess                    # Main routing file
├── sk-bakers-logo.png          # Your logo file
├── backend/                     # PHP Backend
│   ├── api/
│   ├── config/
│   │   └── config.php          # Production config
│   ├── includes/
│   ├── middleware/
│   └── logs/                   # Will be created automatically
└── frontend/                   # React Frontend Build
    ├── index.html
    ├── static/
    └── assets/
```

## 📋 **DEPLOYMENT CHECKLIST**

### **✅ Step 1: Prepare Files**
- [ ] Run `build_frontend.bat` to create production build
- [ ] Update database password in `setup_hostinger_database.php`
- [ ] Update database password in `php-backend/config/config_production.php`

### **✅ Step 2: Upload to Hostinger**
- [ ] Upload `.htaccess` to `public_html/`
- [ ] Upload `sk-bakers-logo.png` to `public_html/`
- [ ] Upload entire `php-backend/` folder to `public_html/backend/`
- [ ] Upload `frontend/build/` contents to `public_html/frontend/`

### **✅ Step 3: Database Setup**
- [ ] Upload `setup_hostinger_database.php` to `public_html/`
- [ ] Visit `https://skbakers.com/setup_hostinger_database.php`
- [ ] Delete `setup_hostinger_database.php` after setup

### **✅ Step 4: Configuration**
- [ ] Rename `config_production.php` to `config.php` in `backend/config/`
- [ ] Update database credentials in `backend/config/config.php`
- [ ] Test admin login: `admin@skbakers.com` / `admin123`

### **✅ Step 5: Testing**
- [ ] Visit `https://skbakers.com` - Frontend should load
- [ ] Test API: `https://skbakers.com/api/` - Should return API info
- [ ] Test admin panel: `https://skbakers.com/admin`
- [ ] Test email functionality from admin panel

## 🔧 **IMPORTANT CONFIGURATIONS**

### **Database Credentials (Update These):**
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u707629033_skbakers_001');
define('DB_USER', 'u707629033_skbakers');
define('DB_PASS', 'YOUR_ACTUAL_DATABASE_PASSWORD'); // Update this!
```

### **Email Configuration (Already Set):**
```php
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'info@upgradenow.in');
define('SMTP_PASSWORD', '0056@Ravi');
```

### **Domain Configuration:**
```php
define('BASE_URL', 'https://skbakers.com');
define('ALLOWED_ORIGINS', ['https://skbakers.com', 'https://www.skbakers.com']);
```

## 🚀 **QUICK DEPLOYMENT STEPS**

1. **Build Frontend**: Run `build_frontend.bat`
2. **Upload Files**: Use FileZilla or Hostinger File Manager
3. **Setup Database**: Run `setup_hostinger_database.php`
4. **Configure**: Update database password in config files
5. **Test**: Visit your domain and test all functionality

## 📧 **ADMIN CREDENTIALS**
- **Email**: `admin@skbakers.com`
- **Password**: `admin123`
- **URL**: `https://skbakers.com/admin`

## 🎯 **FINAL RESULT**
Your SK Bakers e-commerce website will be live at:
- **Frontend**: `https://skbakers.com`
- **Admin Panel**: `https://skbakers.com/admin`
- **API**: `https://skbakers.com/api/`
