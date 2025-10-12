# Quick Start - Migration in 5 Minutes! ⚡

## Super Fast Migration Guide

Follow these steps to migrate from MongoDB to MySQL:

---

## 🚀 Step 1: Prepare (1 minute)

### Windows Users:
1. Double-click **`RUN_MIGRATION.bat`**
2. Follow the prompts

### Mac/Linux Users:
```bash
# Install dependencies
npm install

# Test MongoDB connection
npm run test-connection

# Run migration
npm run migrate
```

---

## 📊 Step 2: What Happens? (2-5 minutes)

The script will:

1. ✅ Connect to your MongoDB
2. ✅ Export all data (users, products, orders, etc.)
3. ✅ Convert to MySQL format
4. ✅ Generate `migrated-data.sql` file

**Wait for:** "✨ Migration complete!" message

---

## 🗄️ Step 3: Import to MySQL (2 minutes)

### Option A: Using phpMyAdmin (Hostinger)

1. **Go to phpMyAdmin** (Hostinger control panel)

2. **Create Database:**
   - Click "New" in left sidebar
   - Database name: `skbakers` (or your choice)
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

3. **Import Schema:**
   - Select your database
   - Click "Import" tab
   - Choose file: `php-backend/database/schema.sql`
   - Click "Go"
   - Wait for success message

4. **Import Data:**
   - Still in Import tab
   - Choose file: `migrated-data.sql`
   - Click "Go"
   - Wait (may take 2-5 minutes)

### Option B: Using Command Line

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE skbakers CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
mysql -u root -p skbakers < php-backend/database/schema.sql

# Import data
mysql -u root -p skbakers < migrated-data.sql
```

---

## ⚙️ Step 4: Configure PHP Backend (30 seconds)

Edit `php-backend/.env`:

```env
# Update these lines
DB_NAME=skbakers
DB_USER=root
DB_PASS=your-password

# Generate a random JWT secret (40+ characters)
JWT_SECRET=your-very-long-random-string-here

# Your frontend URL
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

---

## 🧪 Step 5: Test Everything (1 minute)

### Test 1: Check Data

Open phpMyAdmin and run:

```sql
-- Check if data imported
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM orders;

-- View sample data
SELECT * FROM users LIMIT 5;
SELECT * FROM products LIMIT 5;
```

### Test 2: Test API (if running locally)

```bash
# Start PHP server (if testing locally)
cd php-backend
php -S localhost:8000

# Test in browser or curl
curl http://localhost:8000/
```

---

## 🎯 Step 6: Update React Frontend (30 seconds)

In your React project:

```javascript
// .env
VITE_API_BASE_URL=http://localhost:8000

// Or for production
VITE_API_BASE_URL=https://yourdomain.com/api
```

---

## ✅ Verification Checklist

- [ ] `migrated-data.sql` file created
- [ ] MySQL database created
- [ ] Schema imported (15+ tables visible)
- [ ] Data imported (check counts)
- [ ] PHP backend `.env` configured
- [ ] API responds at `/api/`
- [ ] Can login with existing user
- [ ] Products display correctly

---

## 🚨 Common Issues

### Issue: "Cannot connect to MongoDB"

**Fix:**
1. Make sure MongoDB is running
2. Update connection string in `migrate-mongodb-to-mysql.js`:
   ```javascript
   const MONGODB_URI = 'mongodb://localhost:27017/your-db-name';
   ```

### Issue: "npm not found"

**Fix:**
Install Node.js from: https://nodejs.org/

### Issue: "MySQL import fails"

**Fix:**
- File too large? Increase phpMyAdmin limits
- Or split the SQL file into smaller chunks
- Or use command line: `mysql -u root -p skbakers < migrated-data.sql`

### Issue: "Login doesn't work after migration"

**Fix:**
Passwords should work. If not, users can reset passwords via "Forgot Password"

---

## 📞 Need Help?

Check these files:
- **`MIGRATION_GUIDE.md`** - Detailed guide
- **`DEPLOYMENT_COMPLETE.md`** - Deployment instructions
- **`CONVERSION_SUMMARY.md`** - Overview

---

## 🎉 Success!

If you can:
- ✅ See data in MySQL
- ✅ API responds
- ✅ Login works
- ✅ Products display

**You're done! 🚀**

Your MongoDB data is now in MySQL and your PHP backend is ready!

---

## 📝 Summary of Commands

```bash
# Quick migration
npm install
npm run migrate

# MySQL import
mysql -u root -p skbakers < php-backend/database/schema.sql
mysql -u root -p skbakers < migrated-data.sql

# Test
curl http://localhost:8000/api/
```

That's it! **5 minutes from start to finish!** ⚡
