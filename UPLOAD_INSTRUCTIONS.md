# 📤 UPLOAD INSTRUCTIONS FOR HOSTINGER

## ✅ Files Ready to Upload

Your SQL files are ready:
- ✅ `schema.sql` (19 KB) - Creates tables
- ✅ `migrated-data.sql` (572 KB) - Your data

---

## 📋 STEP-BY-STEP UPLOAD GUIDE

### Step 1: Import to phpMyAdmin (You're Here!)

**A. Import Schema First:**
1. Click **"Enter phpMyAdmin"** button (purple button)
2. In phpMyAdmin → Click **"Import"** tab
3. Click **"Choose File"**
4. Select: `php-backend/database/schema.sql`
5. Click **"Go"** button
6. Wait for: "Import has been successfully finished"

**B. Import Data Second:**
1. Still in phpMyAdmin → Click **"Import"** tab again
2. Click **"Choose File"**
3. Select: `migrated-data.sql`
4. Click **"Go"** button
5. Wait 1-2 minutes
6. Success: "Import has been successfully finished"

**C. Verify Data:**
Click "SQL" tab and run:
```sql
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'categories', COUNT(*) FROM categories;
```

Expected:
- users: 15
- products: 381
- orders: 68
- categories: 21

---

### Step 2: Update .env File

**Edit: `php-backend/.env`**

```env
# Database Configuration (UPDATE THESE!)
DB_HOST=localhost
DB_NAME=u707629033_skbakers_main
DB_USER=u707629033_admin
DB_PASS=YOUR_ACTUAL_PASSWORD

# JWT Secret (random 40+ characters)
JWT_SECRET=hK8nP2vQ9xL4mR6yT3wS7zA1bN5cM8dF0eG2hJ4kL6pQ9rX5tU7vW9y

# CORS (your domains)
ALLOWED_ORIGINS=http://localhost:5173,https://skbakers.com,https://www.skbakers.com

# API URL
BASE_URL=https://skbakers.com/api

# Frontend URL
FRONTEND_URL=https://skbakers.com

# Upload Settings
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp
```

⚠️ **IMPORTANT:** Change `YOUR_ACTUAL_PASSWORD` to your database password!

---

### Step 3: Upload Backend Files

**Using Hostinger File Manager:**

1. **Go to File Manager:**
   - Hostinger Dashboard → Website → File Manager

2. **Navigate to public_html:**
   - Open `public_html/` folder

3. **Create API Folder:**
   - Click "New Folder" button
   - Name it: `api`
   - Open the `api/` folder

4. **Upload These Folders:**
   - Upload: `api/` folder (11 PHP files)
   - Upload: `config/` folder
   - Upload: `database/` folder
   - Upload: `includes/` folder
   - Upload: `middleware/` folder

5. **Upload These Files:**
   - Upload: `.env` (configured)
   - Upload: `.htaccess` (IMPORTANT!)
   - Upload: `index.php`

6. **Create Additional Folders:**
   - Create: `uploads/` (for images)
   - Create: `logs/` (for error logs)

7. **Set Permissions:**
   - Right-click `uploads/` → Permissions → 755
   - Right-click `logs/` → Permissions → 755
   - Right-click `.env` → Permissions → 644

---

### Step 4: Test Your API

**Visit in browser:**
```
https://skbakers.com/api/
```

**Expected Response:**
```json
{
  "success": true,
  "message": "SK Bakers E-Commerce API is running",
  "data": {
    "version": "2.0.0",
    "environment": "production"
  }
}
```

**Test Other Endpoints:**
```
https://skbakers.com/api/products      → Should show 381 products
https://skbakers.com/api/categories    → Should show 21 categories
https://skbakers.com/api/health        → Should show "healthy"
```

---

### Step 5: Update React Frontend

**In your React project:**

**Edit `.env` or `.env.production`:**
```env
VITE_API_BASE_URL=https://skbakers.com/api
```

**Rebuild:**
```bash
npm run build
```

**Deploy:**
- Upload `dist/` folder to Hostinger or your hosting
- Or deploy to Netlify/Vercel

---

## 🧪 Test Login

**Try logging in with existing user:**
```
Email: admin1@shop.com
Password: (your existing password from data)
```

All 15 users from your old system can login with their existing passwords!

---

## 📂 Folder Structure on Hostinger

After upload, your server should look like:

```
public_html/
└── api/
    ├── api/
    │   ├── auth.php
    │   ├── products.php
    │   ├── orders.php
    │   └── ... (11 files total)
    ├── config/
    │   ├── config.php
    │   └── database.php
    ├── database/
    │   └── schema.sql
    ├── includes/
    │   ├── helpers.php
    │   └── response.php
    ├── middleware/
    │   ├── auth.php
    │   └── cors.php
    ├── uploads/
    ├── logs/
    ├── .env
    ├── .htaccess
    └── index.php
```

---

## 🆘 Troubleshooting

### Issue: "Database connection failed"
**Fix:** Check database credentials in `.env`

### Issue: "404 Not Found"
**Fix:** Make sure `.htaccess` is uploaded

### Issue: "CORS error"
**Fix:** Add your frontend domain to `ALLOWED_ORIGINS` in `.env`

### Issue: "Images not loading"
**Fix:**
- Copy images from old backend `uploads/` folder
- Upload to `public_html/api/uploads/`
- Set permissions to 755

---

## ✅ Deployment Checklist

- [ ] Import schema.sql in phpMyAdmin
- [ ] Import migrated-data.sql in phpMyAdmin
- [ ] Verify data counts (15, 381, 68, 21)
- [ ] Update .env with database credentials
- [ ] Upload all backend files to public_html/api/
- [ ] Create uploads/ and logs/ folders
- [ ] Set folder permissions
- [ ] Test API: https://skbakers.com/api/
- [ ] Update React frontend API URL
- [ ] Rebuild React app
- [ ] Deploy React app
- [ ] Test login with existing user
- [ ] Test placing an order
- [ ] Test admin panel

---

## 🎉 You're Almost Done!

Current Status:
- ✅ Database created
- ✅ SQL files ready
- ⏳ Waiting for import
- ⏳ Waiting for file upload

**Next:** Import the SQL files in phpMyAdmin!

---

**Files Location:**
- Schema: `C:\Users\jeyakrishna\Documents\php-sweetshop-kvp\php-backend\database\schema.sql`
- Data: `C:\Users\jeyakrishna\Documents\php-sweetshop-kvp\migrated-data.sql`
- Backend: `C:\Users\jeyakrishna\Documents\php-sweetshop-kvp\php-backend\`

**Good luck!** 🚀
