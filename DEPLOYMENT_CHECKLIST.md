# 🚀 Final Deployment Checklist

## ✅ Completed Steps

- [x] PHP backend created (all API endpoints)
- [x] MySQL database schema created
- [x] Data exported from JSON files
- [x] SQL file generated: `migrated-data.sql` (558 KB, 10,857 lines)
- [x] Migration verified:
  - 15 users
  - 381 products
  - 68 orders
  - 21 categories
  - 1 banner
  - 7 reviews

---

## 📋 Deployment Steps

### Step 1: Create MySQL Database on Hostinger

#### Go to Hostinger Control Panel:

1. **Login to Hostinger**
2. **Go to:** Websites → Manage → Databases → MySQL Databases
3. **Click:** "Create New Database"
4. **Fill in:**
   - Database name: `fireworkshub_mysql` (or your choice)
   - Username: Auto-generated (or create custom)
   - Password: Generate strong password
5. **Click:** "Create"
6. **Save these credentials:**
   ```
   Host: localhost
   Database: u123456789_fireworkshub
   Username: u123456789_admin
   Password: [saved password]
   ```

---

### Step 2: Import Database

#### Open phpMyAdmin:

1. From Hostinger control panel → **phpMyAdmin**
2. **Select your database** from left sidebar

#### Import Schema (Create Tables):

1. Click **Import** tab
2. Click **Choose File**
3. Select: `php-backend/database/schema.sql`
4. Click **Go**
5. Wait for: "Import has been successfully finished"
6. **Verify:** You should see 15+ tables in left sidebar:
   - users
   - products
   - orders
   - categories
   - banners
   - reviews
   - wishlist
   - etc.

#### Import Your Data:

1. Still in **Import** tab
2. Click **Choose File**
3. Select: `migrated-data.sql`
4. Click **Go**
5. Wait 1-2 minutes
6. Success message should appear

#### Verify Data Imported:

Click **SQL** tab and run:

```sql
SELECT COUNT(*) as total FROM users;
SELECT COUNT(*) as total FROM products;
SELECT COUNT(*) as total FROM orders;
SELECT COUNT(*) as total FROM categories;
```

Expected results:
- Users: 15
- Products: 381
- Orders: 68
- Categories: 21

---

### Step 3: Upload PHP Backend to Hostinger

#### Using File Manager:

1. **Go to:** File Manager in Hostinger
2. **Navigate to:** `public_html`
3. **Create folder:** `api`
4. **Upload all files** from `php-backend/` folder:
   - Upload: config/
   - Upload: api/
   - Upload: includes/
   - Upload: middleware/
   - Upload: database/
   - Upload: .htaccess
   - Upload: index.php
   - Upload: .env (we'll configure this next)

#### Or Using FTP:

```
Host: ftp.yourdomain.com
Username: [from Hostinger]
Password: [from Hostinger]
Port: 21

Upload to: /public_html/api/
```

---

### Step 4: Configure .env File

#### Edit `public_html/api/.env`:

```env
# Application Settings
APP_NAME="SK Bakers E-Commerce"
APP_ENV=production
APP_VERSION=2.0.0
APP_DEBUG=false

# Database Configuration
DB_HOST=localhost
DB_NAME=u123456789_fireworkshub
DB_USER=u123456789_admin
DB_PASS=your-actual-password-here
DB_PORT=3306

# JWT Authentication - IMPORTANT: Generate random 40+ character string!
JWT_SECRET=hK8nP2vQ9xL4mR6yT3wS7zA1bN5cM8dF0eG2hJ4kL6pQ9rX5tU7vW9y

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

# Base URL
BASE_URL=https://yourdomain.com/api

# File Upload Settings
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp

# Frontend URL
FRONTEND_URL=https://yourdomain.com
```

**⚠️ IMPORTANT:**
- Replace `yourdomain.com` with your actual domain
- Replace database credentials with actual values from Step 1
- Generate a strong JWT_SECRET (use password generator)

---

### Step 5: Set Folder Permissions

#### In File Manager:

1. Right-click `uploads/` folder → Permissions → 755
2. Right-click `logs/` folder → Permissions → 755
3. Right-click `.env` file → Permissions → 644

#### Or via FTP/Terminal:

```bash
chmod 755 uploads/
chmod 755 logs/
chmod 644 .env
chmod 644 .htaccess
```

---

### Step 6: Test PHP API

#### Test 1: Root Endpoint

Visit in browser:
```
https://yourdomain.com/api/
```

**Expected Response:**
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

#### Test 2: Health Check

```
https://yourdomain.com/api/health
```

#### Test 3: Products

```
https://yourdomain.com/api/products
```

Should return your 381 products.

#### Test 4: Categories

```
https://yourdomain.com/api/categories
```

Should return your 21 categories.

#### Test 5: Login

Use existing user account:
```bash
POST https://yourdomain.com/api/auth/login
Content-Type: application/json

{
  "email": "admin1@shop.com",
  "password": "your-password"
}
```

---

### Step 7: Upload Images

Your product images need to be accessible:

#### Option A: Upload Existing Images

1. Copy `fireworks-ecommerce-main/ecommerce-website/backend/uploads/` folder
2. Upload to `public_html/api/uploads/` on Hostinger

#### Option B: Update Image URLs

If images are already hosted elsewhere, they should work as-is.

---

### Step 8: Update React Frontend

#### Update API URL:

**In your React project:**

1. **Edit `.env` or `.env.production`:**
   ```env
   VITE_API_BASE_URL=https://yourdomain.com/api
   ```

2. **Or edit config file** (e.g., `src/config/api.js`):
   ```javascript
   export const API_BASE_URL = 'https://yourdomain.com/api';
   ```

#### Rebuild Frontend:

```bash
cd your-react-project
npm run build
```

#### Deploy Frontend:

Upload `dist/` folder to:
- Netlify
- Vercel
- Hostinger (public_html)
- Or your hosting

---

### Step 9: Final Testing

Test all features on live site:

#### Public Features:
- [ ] Homepage loads
- [ ] Products display correctly
- [ ] Product images show
- [ ] Search works
- [ ] Category filter works
- [ ] Product details page
- [ ] Add to cart
- [ ] Wishlist
- [ ] User registration
- [ ] User login

#### User Features:
- [ ] Profile page
- [ ] Edit profile
- [ ] Addresses management
- [ ] Order history
- [ ] Order tracking
- [ ] Checkout process
- [ ] Order placement

#### Admin Features:
- [ ] Admin login (admin1@shop.com)
- [ ] Dashboard loads
- [ ] View products
- [ ] Add/edit products
- [ ] Manage orders
- [ ] Update order status
- [ ] View customers
- [ ] Analytics/reports

---

### Step 10: Security

#### Change Default Passwords:

1. **Admin Account:**
   - Login with: admin1@shop.com
   - Change password immediately

2. **Database Password:**
   - Already set in Step 1 ✓

3. **JWT Secret:**
   - Already set in Step 4 ✓

#### Enable HTTPS:

1. In Hostinger: SSL/TLS → Install SSL Certificate
2. Force HTTPS (already in .htaccess)

---

## 🎯 Success Criteria

Your deployment is successful when:

- [x] API responds at `/api/`
- [x] Health check returns "healthy"
- [x] Products API returns 381 products
- [x] Categories API returns 21 categories
- [x] Users can login
- [x] React frontend displays products
- [x] Cart works
- [x] Checkout works
- [x] Orders are created
- [x] Admin panel accessible
- [x] No console errors

---

## 🔧 Troubleshooting

### Issue: "Database connection failed"

**Check:**
- Database credentials in `.env`
- Database exists in phpMyAdmin
- User has permissions

**Fix:**
```php
// Test database connection
mysql -u username -p database_name
```

### Issue: "CORS error in frontend"

**Check:**
- ALLOWED_ORIGINS in `.env`
- Includes your frontend URL

**Fix:**
```env
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com,https://www.yourdomain.com
```

### Issue: "404 Not Found"

**Check:**
- `.htaccess` file uploaded
- mod_rewrite enabled (usually default)

### Issue: "Images not showing"

**Check:**
- `uploads/` folder exists
- Permissions set to 755
- Images uploaded

### Issue: "Login doesn't work"

**Check:**
- JWT_SECRET is set
- Database has users
- Passwords are hashed

**Test:**
```sql
SELECT email, role FROM users WHERE email = 'admin1@shop.com';
```

---

## 📊 Database Quick Reference

### Important Tables:

```sql
-- View all tables
SHOW TABLES;

-- Check data counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'categories', COUNT(*) FROM categories;

-- View recent orders
SELECT id, user_id, tracking_number, status, total_price, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- View users
SELECT id, name, email, role, is_active, created_at
FROM users
ORDER BY created_at DESC;
```

---

## 📝 Post-Deployment

### Daily Checks:
- Monitor error logs: `logs/activity.log`
- Check order processing
- Verify email notifications

### Weekly Tasks:
- Database backup (phpMyAdmin → Export)
- Review analytics
- Check server resources

### Monthly Tasks:
- Update PHP backend if needed
- Security audit
- Performance optimization

---

## 🎉 Congratulations!

You've successfully:
- ✅ Converted Node.js backend to PHP
- ✅ Migrated data from JSON to MySQL
- ✅ Deployed to Hostinger
- ✅ React frontend connected
- ✅ Production ready!

**Your e-commerce site is now live on affordable shared hosting!** 🚀

---

## 📞 Quick Commands

```bash
# Test API
curl https://yourdomain.com/api/

# Test products
curl https://yourdomain.com/api/products

# Test login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin1@shop.com","password":"password"}'

# Check database
mysql -u username -p database_name -e "SELECT COUNT(*) FROM products;"
```

---

## 📚 Documentation Reference

- **START_HERE.md** - Getting started
- **QUICK_START.md** - 5-minute guide
- **MIGRATION_GUIDE.md** - Detailed migration
- **DEPLOYMENT_COMPLETE.md** - Full deployment
- **FINAL_SUMMARY.md** - Complete overview
- **API_REFERENCE.md** - API documentation

---

**Need help?** Check the documentation or Hostinger support!
