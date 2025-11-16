# 🚀 PRODUCTION DEPLOYMENT GUIDE - SK BAKERS

## ✅ Pre-Deployment Checklist

### Security Fixes Applied:
- ✅ OTP not exposed in production responses
- ✅ Email verification required for login
- ✅ Password validation consistent (8 characters minimum)
- ✅ Cart icon added to navbar
- ✅ Product code issues fixed
- ✅ Login/Signup code reviewed and secured

---

## 📋 Step-by-Step Deployment Instructions

### Step 1: Build Frontend for Production

```bash
# Navigate to frontend directory
cd fireworks-ecommerce-main/ecommerce-website/ecommerce-frontend

# Install dependencies (if not already installed)
npm install

# Build for production
npm run build
```

**Expected Output:**
- Build folder: `dist/` directory created
- Contains: `index.html`, `assets/`, `static/` folders

---

### Step 2: Update PHP Backend Configuration

#### Option A: Use Production Config File

1. **Copy production config:**
   ```bash
   cp php-backend/config/config_production.php php-backend/config/config.php
   ```

2. **Or manually update `php-backend/config/config.php`:**
   ```php
   // Set environment
   define('APP_ENV', 'production');
   define('ENVIRONMENT', 'production'); // Add this line
   
   // Error reporting (hide errors in production)
   error_reporting(0);
   ini_set('display_errors', 0);
   ini_set('log_errors', 1);
   
   // Update database credentials
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'u707629033_skbakers');
   define('DB_USER', 'u707629033_sksweets');
   define('DB_PASS', 'Skbakers@123');
   
   // Update base URLs
   define('BASE_URL', 'https://skbakers.com');
   define('API_BASE_URL', 'https://skbakers.com/api');
   ```

---

### Step 3: Upload Files to Hostinger

#### A. Upload PHP Backend

**Using File Manager or FTP:**

1. **Navigate to:** `public_html/` on Hostinger
2. **Create/Upload these folders:**
   ```
   public_html/
   ├── api/                    # PHP Backend API
   │   ├── index.php
   │   ├── auth.php
   │   ├── products.php
   │   ├── orders.php
   │   └── ... (all API files)
   ├── backend/                # Backend files
   │   ├── config/
   │   │   └── config.php      # Production config
   │   ├── includes/
   │   ├── middleware/
   │   └── uploads/            # Create this folder
   └── logs/                   # Create this folder
   ```

2. **Upload all files from:**
   - `php-backend/api/` → `public_html/api/`
   - `php-backend/config/` → `public_html/backend/config/`
   - `php-backend/includes/` → `public_html/backend/includes/`
   - `php-backend/middleware/` → `public_html/backend/middleware/`

#### B. Upload Frontend Build

1. **Upload contents of `dist/` folder to:**
   ```
   public_html/
   ├── index.html              # Main HTML file
   ├── assets/                 # JS/CSS files
   └── static/                 # Static assets
   ```

---

### Step 4: Set File Permissions

**In Hostinger File Manager:**

1. Right-click `backend/uploads/` → **Permissions** → Set to **755**
2. Right-click `logs/` → **Permissions** → Set to **755**
3. Right-click `backend/config/config.php` → **Permissions** → Set to **644**

**Or via SSH:**
```bash
chmod 755 backend/uploads/
chmod 755 logs/
chmod 644 backend/config/config.php
```

---

### Step 5: Configure .htaccess for Routing

**Create/Update `public_html/.htaccess`:**

```apache
# Enable Rewrite Engine
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API Routes - Forward to PHP backend
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ /api/index.php [QSA,L]

# Frontend Routes - Serve index.html for React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(?!api/).*$ /index.html [L]

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Disable directory browsing
Options -Indexes

# Protect sensitive files
<FilesMatch "\.(env|log|ini|conf)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

---

### Step 6: Verify Database Connection

**Test API endpoint:**
```
https://skbakers.com/api/products?limit=5
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "data": [...products...],
    "pagination": {...}
  }
}
```

---

### Step 7: Test Critical Features

#### ✅ Test Login:
```
POST https://skbakers.com/api/auth/login
Body: { "email": "test@example.com", "password": "password" }
```

#### ✅ Test Signup:
```
POST https://skbakers.com/api/auth/register
Body: { "name": "Test User", "email": "new@example.com", "password": "password123", "phone": "1234567890" }
```

**Verify:**
- OTP is NOT in response (production mode)
- Email verification required before login
- Cart icon visible in navbar

#### ✅ Test Products:
```
GET https://skbakers.com/api/products
```

#### ✅ Test Cart:
- Add items to cart
- Verify cart icon shows count badge
- Check cart persists in localStorage

---

### Step 8: Environment Variables Check

**Verify in `php-backend/config/config.php`:**

```php
// Production settings
define('APP_ENV', 'production');
define('ENVIRONMENT', 'production'); // Required for OTP security

// Error reporting OFF
error_reporting(0);
ini_set('display_errors', 0);

// Production URLs
define('BASE_URL', 'https://skbakers.com');
define('API_BASE_URL', 'https://skbakers.com/api');
```

---

### Step 9: Security Verification

#### ✅ Check OTP Security:
1. Sign up a new user
2. Check API response - **OTP should NOT be included**
3. Check server logs - OTP should only log in development mode

#### ✅ Check Email Verification:
1. Sign up new user
2. Try to login without verifying email
3. Should get error: "Email not verified"

#### ✅ Check Password Requirements:
1. Try password reset with 6 characters
2. Should fail (requires 8 characters)

---

### Step 10: Performance Optimization

#### Enable Gzip Compression

**Add to `.htaccess`:**
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

#### Enable Browser Caching

**Add to `.htaccess`:**
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## 🔍 Post-Deployment Verification

### Checklist:

- [ ] Frontend loads correctly at `https://skbakers.com`
- [ ] API endpoints respond at `https://skbakers.com/api/*`
- [ ] Login works correctly
- [ ] Signup works and sends OTP email
- [ ] OTP NOT visible in API responses
- [ ] Email verification required for login
- [ ] Cart icon visible in navbar with badge
- [ ] Products display correctly
- [ ] Images load properly
- [ ] No console errors in browser
- [ ] HTTPS enforced (no HTTP access)
- [ ] Database connection working
- [ ] File uploads working (if applicable)

---

## 🐛 Troubleshooting

### Issue: API returns 404
**Solution:** Check `.htaccess` routing rules

### Issue: CORS errors
**Solution:** Verify `ALLOWED_ORIGINS` in `config.php` includes `https://skbakers.com`

### Issue: OTP still in response
**Solution:** Verify `ENVIRONMENT` constant is set to `'production'` in `config.php`

### Issue: Images not loading
**Solution:** Check file permissions on `uploads/` folder (should be 755)

### Issue: Database connection failed
**Solution:** Verify database credentials in `config.php` match Hostinger database

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check server error logs: `backend/logs/php-error.log`
3. Verify all file permissions
4. Test API endpoints directly

---

## ✅ Deployment Complete!

Your SK Bakers e-commerce platform is now live at:
**https://skbakers.com**

All security fixes are in place:
- ✅ OTP not exposed
- ✅ Email verification required
- ✅ Password validation secure
- ✅ Cart icon with badge
- ✅ Production-ready code

