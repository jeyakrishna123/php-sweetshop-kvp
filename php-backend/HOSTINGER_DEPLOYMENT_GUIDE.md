# 🚀 Complete Hostinger Deployment Guide

## 📋 **Step-by-Step Hostinger Deployment**

### **Phase 1: Prepare Your Files**

#### **Step 1.1: Update Database Configuration**
```php
// Edit: php-backend/config/database.php
// Update these values with your Hostinger database credentials:

$this->host = 'localhost';  // Usually localhost on Hostinger
$this->db_name = 'u707629033_skbakers_main';  // Your database name
$this->username = 'u707629033_admin';  // Your database username
$this->password = 'YOUR_ACTUAL_PASSWORD';  // Your database password
```

#### **Step 1.2: Update JWT Secret**
```php
// Edit: php-backend/config/config.php
// Change this to a secure random string:

define('JWT_SECRET', 'your-very-long-secure-random-string-here');
```

#### **Step 1.3: Update CORS Origins**
```php
// Edit: php-backend/config/config.php
// Add your production domain:

define('ALLOWED_ORIGINS', [
    'http://localhost:5173',  // Development
    'https://skbakers.com',  // Your production domain
    'https://www.skbakers.com'  // With www
]);
```

### **Phase 2: Upload Files to Hostinger**

#### **Step 2.1: Access Hostinger File Manager**
1. **Login to Hostinger Control Panel**
2. **Go to Files → File Manager**
3. **Navigate to `public_html` directory**

#### **Step 2.2: Create API Directory**
```
public_html/
└── api/  ← Create this folder
    ├── config/
    ├── api/
    ├── includes/
    ├── middleware/
    ├── database/
    ├── uploads/
    ├── logs/
    ├── vendor/
    ├── .htaccess
    ├── index.php
    └── README.md
```

#### **Step 2.3: Upload All Files**
1. **Compress your `php-backend` folder** (ZIP file)
2. **Upload ZIP to `public_html/api/`**
3. **Extract the ZIP file**
4. **Delete the ZIP file**

**OR**

1. **Upload files one by one** using File Manager
2. **Maintain the folder structure**

### **Phase 3: Database Setup**

#### **Step 3.1: Create MySQL Database (if not already done)**
1. **Go to Hostinger Control Panel**
2. **Navigate to Databases → MySQL Databases**
3. **Create New Database:**
   - Database name: `u707629033_skbakers_main`
   - Username: `u707629033_admin`
   - Password: `[Generate strong password]`
4. **Note down the credentials**

#### **Step 3.2: Import Database Schema**
1. **Go to phpMyAdmin** (from Hostinger control panel)
2. **Select your database** (`u707629033_skbakers_main`)
3. **Click "Import" tab**
4. **Choose file:** Upload `database/schema.sql`
5. **Click "Go" to import**
6. **Wait for success message**

#### **Step 3.3: Verify Database Import**
1. **Check tables created** (should see 17+ tables)
2. **Verify default admin user:**
   ```sql
   SELECT * FROM users WHERE role = 'admin';
   ```
3. **Default admin credentials:**
   - Email: `admin@skbakers.com`
   - Password: `admin123456`

### **Phase 4: Configure Environment**

#### **Step 4.1: Update Database Credentials**
```php
// File: public_html/api/config/database.php
// Update with your actual Hostinger database credentials:

$this->host = 'localhost';
$this->db_name = 'u707629033_skbakers_main';
$this->username = 'u707629033_admin';
$this->password = 'YOUR_ACTUAL_HOSTINGER_PASSWORD';
```

#### **Step 4.2: Update Base URLs**
```php
// File: public_html/api/config/config.php
// Update with your domain:

define('BASE_URL', 'https://skbakers.com/api');
define('API_BASE_URL', 'https://skbakers.com/api');
```

#### **Step 4.3: Update CORS Settings**
```php
// File: public_html/api/config/config.php
// Add your production domains:

define('ALLOWED_ORIGINS', [
    'https://skbakers.com',
    'https://www.skbakers.com',
    'http://localhost:5173'  // For development
]);
```

### **Phase 5: Set Permissions**

#### **Step 5.1: Set Folder Permissions**
```bash
# Via File Manager, set these permissions:
uploads/ → 755
logs/ → 755
vendor/ → 755
```

#### **Step 5.2: Set File Permissions**
```bash
# Via File Manager, set these permissions:
config/ → 644
.htaccess → 644
index.php → 644
```

### **Phase 6: Test Your Deployment**

#### **Step 6.1: Test API Endpoints**
Visit these URLs in your browser:

1. **Root API:** `https://skbakers.com/api/`
2. **Health Check:** `https://skbakers.com/api/health`
3. **Products API:** `https://skbakers.com/api/products`
4. **Categories API:** `https://skbakers.com/api/categories`

#### **Step 6.2: Expected Responses**
```json
// Root API Response:
{
  "success": true,
  "message": "SK Bakers E-Commerce API is running",
  "data": {
    "version": "2.0.0",
    "environment": "production"
  }
}
```

#### **Step 6.3: Test Database Connection**
```bash
# Test admin login:
POST https://skbakers.com/api/auth/login
{
  "email": "admin@skbakers.com",
  "password": "admin123456"
}
```

### **Phase 7: Deploy React Frontend**

#### **Step 7.1: Update Frontend API URL**
```javascript
// File: ecommerce-frontend/src/config/api.js
// Update with your production API URL:

BASE_URL: 'https://skbakers.com/api'
```

#### **Step 7.2: Build React Frontend**
```bash
cd fireworks-ecommerce-main/ecommerce-website/ecommerce-frontend
npm install
npm run build
```

#### **Step 7.3: Deploy Frontend**
**Option A: Upload to Hostinger**
1. **Upload `dist/` folder contents** to `public_html/`
2. **Update API URL** in built files

**Option B: Deploy to Netlify/Vercel**
1. **Connect your GitHub repository**
2. **Set build command:** `npm run build`
3. **Set publish directory:** `dist`
4. **Add environment variable:**
   ```
   VITE_API_URL=https://skbakers.com/api
   ```

### **Phase 8: Security Configuration**

#### **Step 8.1: Change Default Admin Password**
```sql
-- In phpMyAdmin, run this SQL:
UPDATE users 
SET password = '$2y$12$NEW_HASHED_PASSWORD' 
WHERE email = 'admin@skbakers.com';
```

#### **Step 8.2: Enable HTTPS**
1. **Go to Hostinger Control Panel**
2. **Navigate to Security → SSL**
3. **Enable SSL certificate**
4. **Force HTTPS redirect**

#### **Step 8.3: Update .htaccess for HTTPS**
```apache
# File: public_html/api/.htaccess
# Uncomment these lines:

RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### **Phase 9: Final Testing**

#### **Step 9.1: Test Complete Application**
1. **Visit your website:** `https://skbakers.com`
2. **Test user registration**
3. **Test user login**
4. **Test product browsing**
5. **Test cart functionality**
6. **Test admin panel:** `https://skbakers.com/admin`

#### **Step 9.2: Test Admin Panel**
1. **Login with admin credentials**
2. **Test product management**
3. **Test order management**
4. **Test user management**

### **Phase 10: Go Live Checklist**

#### **✅ Pre-Launch Checklist**
- [ ] Database imported successfully
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] User registration working
- [ ] User login working
- [ ] Product display working
- [ ] Cart functionality working
- [ ] Admin panel accessible
- [ ] HTTPS enabled
- [ ] Default admin password changed
- [ ] CORS configured correctly
- [ ] File uploads working

#### **✅ Post-Launch Checklist**
- [ ] Monitor error logs
- [ ] Test all user flows
- [ ] Verify payment integration
- [ ] Check email notifications
- [ ] Monitor performance
- [ ] Set up backups

## 🆘 **Troubleshooting**

### **Common Issues & Solutions**

#### **Issue 1: Database Connection Failed**
```php
// Check your database credentials in:
public_html/api/config/database.php

// Verify in Hostinger:
- Database exists
- User has permissions
- Password is correct
```

#### **Issue 2: CORS Errors**
```php
// Update CORS origins in:
public_html/api/config/config.php

// Add your domain to ALLOWED_ORIGINS
```

#### **Issue 3: 500 Internal Server Error**
```bash
# Check error logs:
public_html/api/logs/error.log

# Common causes:
- Database connection issues
- File permissions
- PHP syntax errors
```

#### **Issue 4: File Upload Issues**
```bash
# Check permissions:
uploads/ → 755
logs/ → 755

# Check PHP limits:
upload_max_filesize = 10M
post_max_size = 10M
```

## 📞 **Support Resources**

- **Hostinger Support:** https://www.hostinger.com/help
- **phpMyAdmin Documentation:** https://docs.phpmyadmin.net/
- **PHP Documentation:** https://www.php.net/manual/

## 🎉 **Success!**

Once completed, your e-commerce application will be:
- ✅ **Fully functional** on Hostinger
- ✅ **Secure** with HTTPS and proper authentication
- ✅ **Scalable** with MySQL database
- ✅ **Compatible** with your React frontend
- ✅ **Production-ready** for real customers

**Your Node.js + MongoDB application has been successfully converted to PHP + MySQL and deployed to Hostinger!** 🚀
