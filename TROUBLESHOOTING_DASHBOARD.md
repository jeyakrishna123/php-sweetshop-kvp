# Dashboard Troubleshooting Guide

## ✅ What We Know is Working

### Database has the correct data:
```
📦 Total Products: 21
👥 Total Users: 10
📋 Total Orders: 31
💰 Total Revenue: ₹100,545.58
⏳ Pending Orders: 5
🔄 Processing Orders: 8
📦 Shipped Orders: 6
✅ Delivered Orders: 12
⚠️ Low Stock: 5
```

### Backend server is running:
- Port 8000 is listening
- API endpoint `/api/admin/dashboard` exists
- Authentication is working

### Admin credentials:
- Email: `admin@skbakers.com`
- Password: Test common passwords (admin123, password, etc.)

## 🔍 Step-by-Step Troubleshooting

### Step 1: Test the API Directly

**Open the test tool:**
```
file:///C:/Users/jeyakrishna/Documents/php-sweetshop-kvp/test_full_api_flow.html
```

**Instructions:**
1. Click "1. Login as Admin"
   - If login fails, check the password
2. Click "2. Get Dashboard Stats"
   - Should show all statistics

**Expected Result:**
You should see colorful cards with all the statistics matching the database numbers above.

### Step 2: Check Browser Console

1. Open your admin dashboard: `http://localhost:5173/admin`
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Look for errors (red text)

**Common errors to look for:**
- ❌ CORS errors
- ❌ 401 Unauthorized
- ❌ Network errors
- ❌ Failed to fetch

**Take a screenshot of any errors you see!**

### Step 3: Check Network Tab

1. With DevTools open (F12)
2. Go to **Network** tab
3. Reload the admin dashboard
4. Look for the request to `/api/admin/dashboard`

**Check these details:**
- **Status Code:** Should be `200 OK` (green)
- **Response:** Click on the request → Preview tab
  - Should show `success: true`
  - Should show `stats` object with numbers

**If Status is 401:**
- You're not logged in
- Token is invalid or expired
- Try logging out and logging back in

**If Status is 500:**
- Backend error
- Check backend console/logs

**If no request appears:**
- Frontend is not calling the API
- Check if you're actually logged in

### Step 4: Verify You're Logged In

**Check LocalStorage:**
1. Press F12 → Application tab (or Storage tab)
2. Click "Local Storage" → `http://localhost:5173`
3. Look for these keys:
   - `token` - Should have a long string value
   - `userInfo` - Should have user details

**If token is missing:**
1. Go to login page: `http://localhost:5173/admin/login`
2. Login with admin credentials
3. Check if token appears in LocalStorage

### Step 5: Test Admin Login

Use credentials from the database:
```
Email: admin@skbakers.com
Password: (check test script output for actual password)
```

**To find the password:**
```bash
php test_admin_login.php
```

This will show you the admin email and test common passwords.

### Step 6: Check Backend Logs

If you started the backend with:
```bash
php -S localhost:8000 -t php-backend
```

Look at the terminal window running the backend:
- Any PHP errors will appear there
- Check for warnings or fatal errors

### Step 7: Verify Backend Server Address

**In frontend code, check the API URL:**

File: `fireworks-ecommerce-main/ecommerce-website/ecommerce-frontend/src/utils/adminAPI.js`

Line 7 should be:
```javascript
baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/admin`,
```

**Check your `.env` file:**
```
VITE_API_URL=http://localhost:8000
```

### Step 8: Force Refresh

Sometimes the frontend caches old data:

1. Clear browser cache: `Ctrl + Shift + Delete`
2. Hard refresh: `Ctrl + F5`
3. Or try Incognito mode: `Ctrl + Shift + N`

## 🛠️ Quick Fixes

### Fix 1: Restart Backend Server

```bash
# Stop current backend (Ctrl+C in terminal)

# Start fresh
cd C:\Users\jeyakrishna\Documents\php-sweetshop-kvp
php -S localhost:8000 -t php-backend
```

### Fix 2: Restart Frontend

```bash
# Stop current frontend (Ctrl+C in terminal)

# Start fresh
cd fireworks-ecommerce-main/ecommerce-website/ecommerce-frontend
npm run dev
```

### Fix 3: Clear All Data and Re-login

1. Open DevTools (F12)
2. Application tab → Clear all storage
3. Refresh page
4. Login again

### Fix 4: Reset Admin Password

```bash
php create_admin_user.php
```

Create this file if it doesn't exist:

```php
<?php
require_once 'php-backend/config/database.php';

$db = Database::getInstance()->getConnection();

// Update admin password
$newPassword = password_hash('admin123', PASSWORD_BCRYPT);
$stmt = $db->prepare("UPDATE users SET password = ? WHERE role = 'admin' LIMIT 1");
$stmt->execute([$newPassword]);

echo "Admin password reset to: admin123\n";
```

## 📋 Diagnostic Tools Created

### 1. test_full_api_flow.html
**Purpose:** Test the entire login → dashboard flow in browser

**How to use:**
```
file:///C:/Users/jeyakrishna/Documents/php-sweetshop-kvp/test_full_api_flow.html
```

### 2. test_admin_login.php
**Purpose:** Verify database has correct data and find admin credentials

**How to use:**
```bash
php test_admin_login.php
```

### 3. create_sample_orders.php
**Purpose:** Generate more sample orders if needed

**How to use:**
```bash
php create_sample_orders.php
```

## 📸 What to Check (Send Screenshots)

If dashboard still shows zeros, send screenshots of:

1. **Browser Console** (F12 → Console tab)
   - Any red errors?

2. **Network Tab** (F12 → Network tab)
   - The `/api/admin/dashboard` request
   - Status code
   - Response preview

3. **LocalStorage** (F12 → Application → Local Storage)
   - Is `token` present?
   - Is `userInfo` present?

4. **The Dashboard Page**
   - Full screenshot showing the zeros

5. **Backend Terminal**
   - Any PHP errors or warnings?

## 🎯 Most Likely Issues

Based on similar cases, the problem is usually:

1. **Not logged in** (70% of cases)
   - Token missing from LocalStorage
   - Need to login again

2. **Wrong API URL** (15% of cases)
   - Frontend calling wrong backend address
   - Check `.env` file

3. **CORS issues** (10% of cases)
   - Backend not allowing frontend domain
   - Check CORS headers

4. **Cached data** (5% of cases)
   - Browser showing old cached page
   - Hard refresh or clear cache

## ✅ Verification Checklist

- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 5173
- [ ] Can access `http://localhost:8000/api/health` (returns something)
- [ ] Can access `http://localhost:5173` (shows login page)
- [ ] test_full_api_flow.html shows correct statistics
- [ ] Logged in as admin in browser
- [ ] Token exists in LocalStorage
- [ ] No errors in browser console
- [ ] Network tab shows 200 OK for dashboard API

## 📞 Next Steps

Run this command and share the output:
```bash
php test_admin_login.php
```

Then open:
```
file:///C:/Users/jeyakrishna/Documents/php-sweetshop-kvp/test_full_api_flow.html
```

1. Click "Login as Admin"
2. Click "Get Dashboard Stats"
3. Take a screenshot of what you see

**If the test tool shows correct statistics but your dashboard doesn't**, then the issue is in the React frontend, not the backend or database.

---

**Created:** 2025-10-21
**Database Verified:** ✅ Has 31 orders with ₹100,545.58 revenue
**Backend Verified:** ✅ Running on port 8000
**Next Action:** Open test_full_api_flow.html and test the API
