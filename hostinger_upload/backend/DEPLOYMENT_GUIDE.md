# Complete Deployment Guide - Hostinger Step-by-Step

This guide walks you through deploying your PHP backend on Hostinger shared hosting.

## Part 1: Preparing Your Files

### 1.1 Download/Prepare Your PHP Backend
Ensure you have all the files from the `php-backend` folder:
- All `.php` files
- `.htaccess` file
- `database/schema.sql` file
- All folders (api, config, includes, etc.)

### 1.2 Create a ZIP Archive (Optional)
To make uploading easier, create a ZIP file of the entire php-backend folder.

## Part 2: Hostinger Setup

### 2.1 Login to Hostinger
1. Go to https://hostinger.com
2. Login to your account
3. Go to **Hosting** → Click on your hosting plan

### 2.2 Access File Manager
1. In Hostinger control panel, find **Files** section
2. Click on **File Manager**
3. Navigate to `public_html` directory

### 2.3 Create API Directory
1. In `public_html`, create a new folder:
   - Click **New Folder**
   - Name it `api` (or your preferred name)
2. Open the `api` folder

### 2.4 Upload Files
**Option A: Using File Manager**
1. Click **Upload Files**
2. Select all files from php-backend folder
3. Upload (may take a few minutes)

**Option B: Upload ZIP and Extract**
1. Upload the ZIP file
2. Right-click → **Extract**
3. Delete the ZIP file after extraction

**Option C: Using FTP**
1. Get FTP credentials from Hostinger (under **Files** → **FTP Accounts**)
2. Use FileZilla or any FTP client
3. Upload all files to `/public_html/api/`

## Part 3: Database Setup

### 3.1 Create MySQL Database
1. In Hostinger control panel, go to **Databases** → **MySQL Databases**
2. Click **Create New Database**
3. Fill in:
   - **Database Name**: `skbakers_db` (or your choice)
   - **Username**: Will be auto-generated or you can customize
   - **Password**: Create a strong password
4. Click **Create**
5. **IMPORTANT**: Save these credentials:
   ```
   Database Name: u123456789_skbakers
   Username: u123456789_admin
   Password: [your-password]
   Host: localhost
   ```

### 3.2 Import Database Schema
1. Go to **Databases** → **phpMyAdmin**
2. Click on your newly created database in the left sidebar
3. Click the **Import** tab
4. Click **Choose File** → Select `database/schema.sql`
5. Scroll down and click **Go**
6. Wait for success message

### 3.3 Verify Database Import
1. In phpMyAdmin, click on your database
2. You should see tables like:
   - users
   - products
   - orders
   - categories
   - etc.
3. Click on `users` table
4. You should see 1 row (default admin user)

## Part 4: Configuration

### 4.1 Configure Database Connection
1. In File Manager, navigate to `api/config/database.php`
2. Right-click → **Edit**
3. Update these lines (around line 11-14):
   ```php
   private $host = 'localhost';
   private $db_name = 'u123456789_skbakers';    // Your database name
   private $username = 'u123456789_admin';       // Your database username
   private $password = 'your_password_here';     // Your database password
   ```
4. Click **Save Changes**

### 4.2 Configure Application Settings
1. Open `api/config/config.php`
2. Update these critical settings:

   ```php
   // Line 10: Change JWT Secret Key
   define('JWT_SECRET', 'your-unique-secret-key-here-change-this');
   // Generate a random string at https://randomkeygen.com/

   // Line 15: Add your React frontend URLs
   define('ALLOWED_ORIGINS', [
       'http://localhost:5173',              // Keep for local development
       'http://localhost:3000',              // Keep for local development
       'https://your-frontend-domain.com'    // Add your production frontend URL
   ]);

   // Line 53: Update Base URL
   define('BASE_URL', 'https://yourdomain.com/api');
   // Replace 'yourdomain.com' with your actual domain
   ```

3. **For Production**: Change line 7:
   ```php
   define('APP_ENV', 'production');
   ```

4. Click **Save Changes**

### 4.3 Set Folder Permissions
1. In File Manager, navigate to your `api` folder
2. Right-click on `uploads` folder → **Permissions**
   - Set to `755` or check: Owner: Read+Write+Execute, Group: Read+Execute, Public: Read+Execute
3. Do the same for `logs` folder
4. Click **Change**

### 4.4 Verify .htaccess
1. Check if `.htaccess` file is visible in File Manager
2. If not visible, enable **Show Hidden Files** in File Manager settings
3. Ensure `.htaccess` is in the root of your api folder

## Part 5: Testing

### 5.1 Test API Endpoint
1. Open your browser
2. Visit: `https://yourdomain.com/api/`
3. You should see:
   ```json
   {
     "success": true,
     "message": "SK Bakers E-Commerce API is running",
     "data": {
       "version": "2.0.0",
       ...
     }
   }
   ```

### 5.2 Test Health Check
Visit: `https://yourdomain.com/api/health`

Should return:
```json
{
  "success": true,
  "message": "Server is healthy",
  ...
}
```

### 5.3 Test Authentication
**Using Postman or browser extension:**

1. **Login with default admin**:
   ```
   POST https://yourdomain.com/api/auth/login
   Content-Type: application/json

   {
     "email": "admin@skbakers.com",
     "password": "admin123456"
   }
   ```

2. Should return:
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "user": { ... },
       "token": "eyJhbGciOiJIUz..."
     }
   }
   ```

### 5.4 Test Products Endpoint
Visit: `https://yourdomain.com/api/products`

Should return:
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "data": [],
    "pagination": { ... }
  }
}
```

## Part 6: Connect React Frontend

### 6.1 Update Frontend API URL
In your React project, update the API base URL:

**If using .env file:**
```env
VITE_API_BASE_URL=https://yourdomain.com/api
```

**Or in your API config file:**
```javascript
const API_BASE_URL = 'https://yourdomain.com/api';
```

### 6.2 Test Frontend Connection
1. Start your React app locally
2. Try logging in
3. Check browser console for any errors
4. Verify API calls are going to the correct URL

## Part 7: Security Hardening

### 7.1 Change Default Admin Password
1. Login as admin in your React frontend
2. Go to Profile → Change Password
3. Update to a strong password

### 7.2 Enable HTTPS
1. In Hostinger control panel, go to **SSL**
2. Enable **Free SSL Certificate**
3. Wait for activation (5-10 minutes)
4. Update all URLs to use `https://`

### 7.3 Update config.php for Production
```php
// Enable these security settings
define('APP_ENV', 'production');
error_reporting(0);  // Disable error display
ini_set('display_errors', 0);
```

### 7.4 Uncomment HTTPS Force in .htaccess
Edit `.htaccess` and uncomment these lines:
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Part 8: Troubleshooting

### 8.1 500 Internal Server Error
**Check PHP error logs:**
1. Go to **Advanced** → **Error Logs** in Hostinger
2. Look for PHP errors
3. Common issues:
   - Missing database credentials
   - Incorrect file permissions
   - Syntax errors in PHP files

**Fix:**
- Re-check `config/database.php` credentials
- Verify all files uploaded correctly
- Check `.htaccess` syntax

### 8.2 Database Connection Error
**Symptoms:** "Database connection failed"

**Fix:**
1. Verify credentials in `config/database.php`
2. Check if database exists in phpMyAdmin
3. Ensure database user has all privileges
4. Try `localhost` or `127.0.0.1` as host

### 8.3 CORS Errors
**Symptoms:** "Access blocked by CORS policy"

**Fix:**
1. Add your frontend URL to `ALLOWED_ORIGINS` in `config/config.php`
2. Clear browser cache
3. Restart your React dev server
4. Check browser console for exact error

### 8.4 JWT Token Errors
**Symptoms:** "Invalid token" or "Token expired"

**Fix:**
1. Ensure `JWT_SECRET` is set in `config/config.php`
2. Clear browser localStorage
3. Login again to get a new token
4. Verify token is being sent in Authorization header

### 8.5 File Upload Not Working
**Fix:**
1. Check `uploads/` folder exists
2. Set permissions to 755
3. Verify `MAX_FILE_SIZE` in config.php
4. Check PHP upload limits (contact Hostinger support if needed)

## Part 9: Adding Data

### 9.1 Add Products
Use your React admin panel or Postman:

```
POST https://yourdomain.com/api/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Chocolate Cake",
  "description": "Delicious chocolate cake",
  "price": 500,
  "category": "cakes",
  "stock": 10,
  "images": ["image1.jpg"],
  "thumbnail": "thumb.jpg"
}
```

### 9.2 Import Existing Data
If you have data from MongoDB:
1. Export from MongoDB as JSON
2. Convert to SQL INSERT statements
3. Run in phpMyAdmin

## Part 10: Monitoring & Maintenance

### 10.1 Regular Backups
**Database:**
1. phpMyAdmin → Export → SQL
2. Download and save

**Files:**
1. File Manager → Select all → Download

### 10.2 Monitor Logs
Check `logs/activity.log` regularly for:
- Failed login attempts
- Errors
- Unusual activity

### 10.3 Keep Updated
1. Regularly check for PHP updates
2. Monitor Hostinger announcements
3. Keep your React frontend updated

## Success Checklist

- [ ] Files uploaded to Hostinger
- [ ] Database created and schema imported
- [ ] Database credentials configured
- [ ] JWT_SECRET changed
- [ ] ALLOWED_ORIGINS updated with frontend URL
- [ ] BASE_URL set correctly
- [ ] Folders have correct permissions (755)
- [ ] API root endpoint works
- [ ] Health check works
- [ ] Can login with admin account
- [ ] Products endpoint returns data
- [ ] React frontend connects successfully
- [ ] HTTPS enabled
- [ ] Default admin password changed

## Need Help?

1. **Check error logs** in Hostinger control panel
2. **Contact Hostinger support** - They're very helpful with PHP issues
3. **Review this guide** step by step
4. **Check common issues** in Troubleshooting section

---

**Congratulations!** Your PHP backend is now live on Hostinger and your React frontend should work seamlessly with it!
