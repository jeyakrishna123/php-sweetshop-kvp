# Complete Deployment Guide - SK Bakers PHP Backend

## Overview

Your Node.js + MongoDB backend has been **successfully converted** to PHP + MySQL! This guide will help you deploy it to Hostinger shared hosting.

## What's Been Converted

### ✅ Complete Backend Conversion
- **Database**: MongoDB → MySQL with complete schema
- **Language**: Node.js/Express → Pure PHP (no frameworks)
- **All API Endpoints**: 100% functional replacement
- **Authentication**: JWT tokens (compatible with React frontend)
- **File Uploads**: Full support with proper security
- **Admin Panel**: Complete admin functionality

### ✅ API Endpoints Implemented

1. **Authentication** (`/api/auth/*`)
   - Register, Login, Logout
   - Forgot/Reset Password
   - Get Current User

2. **Products** (`/api/products/*`)
   - CRUD operations
   - Search, filter, pagination
   - Categories and flavors
   - Weight options

3. **Orders** (`/api/orders/*`)
   - Create, update, cancel orders
   - Order tracking
   - Status management
   - User & admin views

4. **Users** (`/api/users/*`)
   - Profile management
   - Addresses
   - Preferences
   - Admin user management

5. **Categories** (`/api/categories/*`)
   - CRUD operations
   - Category tree
   - Product counts

6. **Wishlist** (`/api/wishlist/*`)
   - Add/remove products
   - View wishlist
   - Clear wishlist

7. **Reviews** (`/api/reviews/*`)
   - Create, update, delete reviews
   - Product reviews
   - User reviews

8. **Banners** (`/api/banners/*`)
   - CRUD operations
   - Active banners for frontend
   - Reorder functionality

9. **Admin** (`/api/admin/*`)
   - Dashboard statistics
   - Analytics
   - Reports
   - User management
   - Inventory management

10. **Offer Popups** (`/api/offer-popups/*`)
    - CRUD operations
    - Active popups for homepage

11. **Coupons** (`/api/coupons/*`)
    - CRUD operations
    - Validate and apply coupons

---

## Deployment to Hostinger - Step by Step

### Step 1: Upload Files

1. **Connect to Hostinger**
   - Go to **File Manager** or use **FTP client**
   - Navigate to `public_html` directory

2. **Create API Directory**
   ```
   public_html/
   └── api/          ← Create this folder
       ├── config/
       ├── api/
       ├── includes/
       ├── middleware/
       ├── database/
       ├── uploads/
       ├── logs/
       ├── .htaccess
       ├── index.php
       └── .env
   ```

3. **Upload All Files**
   - Upload entire `php-backend` folder contents to `public_html/api/`

### Step 2: Create MySQL Database

1. **In Hostinger Control Panel**
   - Go to **Databases** → **MySQL Databases**
   - Click **Create New Database**
   - Database name: `u123456789_skbakers` (or your choice)
   - Username: Auto-generated or create new
   - Password: Save this securely!

2. **Note Your Database Credentials**
   ```
   Database Host: localhost
   Database Name: u123456789_skbakers
   Database User: u123456789_admin
   Database Pass: [your-password]
   ```

### Step 3: Import Database Schema

1. **Open phpMyAdmin**
   - From Hostinger control panel → **phpMyAdmin**
   - Select your database from left sidebar

2. **Import Schema**
   - Click **Import** tab
   - Choose file: `database/schema.sql`
   - Click **Go**
   - Wait for success message

3. **Verify Tables**
   - Should see 15+ tables created
   - Default admin user is created

### Step 4: Configure Database Connection

1. **Copy .env.example to .env**
   ```bash
   # In File Manager, copy .env.example to .env
   ```

2. **Edit .env file**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_NAME=u123456789_skbakers
   DB_USER=u123456789_admin
   DB_PASS=your-actual-password
   DB_PORT=3306

   # JWT Secret - VERY IMPORTANT!
   JWT_SECRET=create-a-very-long-random-string-here

   # Allowed Origins - Your React Frontend URL
   ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

   # Base URL - Your API URL
   BASE_URL=https://yourdomain.com/api
   ```

3. **Generate JWT Secret**
   - Use a password generator for a long random string (40+ characters)
   - Example: `hK8nP2vQ9xL4mR6yT3wS7zA1bN5cM8dF0eG2hJ4kL6pQ9r`

### Step 5: Set Permissions

```bash
# Via File Manager, set folder permissions:
chmod 755 uploads/
chmod 755 logs/
chmod 644 .env
chmod 644 .htaccess
```

Or in File Manager:
- Right-click folder → **Permissions**
- uploads/: 755
- logs/: 755
- .env: 644

### Step 6: Test the API

1. **Visit API URL**
   ```
   https://yourdomain.com/api/
   ```

2. **Expected Response**
   ```json
   {
     "success": true,
     "message": "SK Bakers E-Commerce API is running",
     "data": {
       "version": "2.0.0",
       "environment": "production",
       ...
     }
   }
   ```

3. **Test Health Check**
   ```
   https://yourdomain.com/api/health
   ```

### Step 7: Test Default Admin Login

**Default Credentials:**
- Email: `admin@skbakers.com`
- Password: `admin123456`

**Test Login:**
```bash
# Using curl or Postman
POST https://yourdomain.com/api/auth/login
Content-Type: application/json

{
  "email": "admin@skbakers.com",
  "password": "admin123456"
}
```

**⚠️ IMPORTANT:** Change admin password immediately!

### Step 8: Update React Frontend

**In your React project:**

1. **Update API Base URL**
   ```javascript
   // .env or config file
   VITE_API_BASE_URL=https://yourdomain.com/api
   ```

2. **No Code Changes Needed!**
   - All endpoints are identical to Node.js backend
   - Same request/response format
   - Same authentication (JWT)

3. **Redeploy Frontend**
   - Build: `npm run build`
   - Upload to Netlify/Vercel/Hostinger

---

## Verification Checklist

### ✅ Backend Checklist
- [ ] API returns success at root endpoint
- [ ] Database tables created (15+ tables)
- [ ] Admin login works
- [ ] JWT tokens generated correctly
- [ ] File uploads work (test banner upload)
- [ ] CORS configured for frontend URL

### ✅ Frontend Checklist
- [ ] API base URL updated
- [ ] Login/Register works
- [ ] Products load correctly
- [ ] Cart/Checkout functional
- [ ] Admin panel accessible
- [ ] Images display correctly

---

## Common Issues & Solutions

### Issue 1: "Database Connection Failed"
**Solution:**
- Verify database credentials in `.env`
- Check database exists in phpMyAdmin
- Ensure user has all privileges on database

### Issue 2: "CORS Error"
**Solution:**
- Add frontend URL to `ALLOWED_ORIGINS` in `.env`
- Clear browser cache
- Check `.htaccess` file is uploaded

### Issue 3: "JWT Token Invalid"
**Solution:**
- Ensure `JWT_SECRET` is set in `.env`
- Same secret must be used for all requests
- Check token format: `Bearer <token>`

### Issue 4: "File Upload Failed"
**Solution:**
- Check `uploads/` folder permissions (755)
- Verify `MAX_FILE_SIZE` in `.env`
- Check PHP upload limits in Hostinger

### Issue 5: "500 Internal Server Error"
**Solution:**
- Check `logs/error.log`
- Enable debug mode temporarily: `APP_DEBUG=true`
- Check PHP error logs in Hostinger control panel

---

## Security Recommendations

### 🔒 Essential Security Steps

1. **Change Default Admin Password**
   ```sql
   UPDATE users
   SET password = '$2y$12$NewHashedPassword'
   WHERE email = 'admin@skbakers.com';
   ```

2. **Protect .env File**
   - Never commit to Git
   - Set proper permissions (644)
   - Included in `.htaccess` protection

3. **Use HTTPS**
   - Enable SSL certificate in Hostinger
   - Force HTTPS in `.htaccess`

4. **Regular Backups**
   - Database: Weekly backups via phpMyAdmin
   - Files: Weekly backups via File Manager

5. **Update JWT Secret**
   - Use strong, random string
   - Never share or commit to Git

---

## Performance Optimization

### Recommended Settings

1. **Enable OPcache**
   - Usually enabled by default on Hostinger
   - Improves PHP performance significantly

2. **Database Indexes**
   - Already included in schema.sql
   - No additional action needed

3. **GZIP Compression**
   - Already configured in `.htaccess`

4. **Browser Caching**
   - Already configured in `.htaccess`

---

## Monitoring & Maintenance

### Activity Logs
```
logs/activity.log
```

### Database Backups
```bash
# Via phpMyAdmin: Export → SQL → Go
# Schedule: Weekly
```

### Update Process
1. Backup database
2. Backup files
3. Upload new files
4. Test thoroughly

---

## Support Resources

- **Hostinger Support**: https://www.hostinger.com/tutorials
- **PHP Documentation**: https://www.php.net/manual/
- **MySQL Documentation**: https://dev.mysql.com/doc/

---

## Summary

### What You Have Now:
✅ Complete PHP + MySQL backend
✅ All API endpoints matching Node.js version
✅ Production-ready code
✅ Hostinger-optimized setup
✅ Secure authentication
✅ Admin panel functionality
✅ File upload support
✅ Comprehensive documentation

### Next Steps:
1. Deploy to Hostinger following this guide
2. Update React frontend API URL
3. Test all features thoroughly
4. Change default admin password
5. Go live! 🚀

---

**Your React frontend will work without ANY code changes!** Just update the API URL and you're done.

Good luck with your deployment! 🎉
