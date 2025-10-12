# SK Bakers E-Commerce - Admin Panel Test Guide

## 🎯 Issue Reported
User tried to login with `admin@test.com` and got error: "Invalid credentials"

## ✅ Root Cause Identified
The email `admin@test.com` does not exist in the database. The correct admin email is `admin@skbakers.com`.

## 🔐 Correct Admin Credentials

### Admin Account (WORKING)
- **Email:** `admin@skbakers.com` ✅
- **Password:** `admin123456` ✅
- **Role:** admin
- **Admin Panel URL:** http://localhost:5174/admin/login

### ⚠️ Common Mistakes
- ❌ `admin@test.com` - This email does NOT exist
- ❌ `admin@admin.com` - This email does NOT exist
- ❌ Using regular login page for admin - Use the dedicated admin login page

---

## 📊 Admin Panel API Endpoints - All Verified Working ✅

### Authentication
```bash
# Admin Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skbakers.com","password":"admin123456"}'

# Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@skbakers.com",
      "role": "admin",
      "is_active": 1
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
✅ STATUS: WORKING
```

### 1. Dashboard Statistics
```bash
curl -s http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# Returns:
- Total users: 5
- Total products: 11
- Total orders: 0
- Total revenue: 0
- Low stock products: 1
- Recent orders: []
✅ STATUS: WORKING
```

### 2. Analytics
```bash
curl -s http://localhost:8000/api/admin/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"

# Returns:
- Daily revenue for last 30 days
- Orders by status
- Top selling products
- New users per day
✅ STATUS: WORKING
```

### 3. Order Statistics
```bash
curl -s http://localhost:8000/api/admin/order-stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Returns:
- Total orders
- Orders by status (pending, confirmed, processing, shipped, delivered, cancelled)
- Total revenue
- Average order value
✅ STATUS: WORKING
```

### 4. User Statistics
```bash
curl -s http://localhost:8000/api/admin/user-stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Returns:
- Total users: 5
- Admin users: 1
- Active users: 5
- Verified users: 1
- Today's registrations: 0
✅ STATUS: WORKING
```

### 5. Users List
```bash
curl -s http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Returns:
- Paginated list of all users
- User details (id, name, email, phone, role, status)
- Pagination info
✅ STATUS: WORKING
```

### 6. Customers List
```bash
curl -s http://localhost:8000/api/admin/customers \
  -H "Authorization: Bearer YOUR_TOKEN"

# Returns:
- List of customers who have placed orders
- Customer stats (total orders, total spent)
- Sorted by total spent
✅ STATUS: WORKING
```

### 7. Inventory Status
```bash
curl -s http://localhost:8000/api/admin/inventory \
  -H "Authorization: Bearer YOUR_TOKEN"

# Returns:
- Inventory summary
- Low stock products (1 product)
- Out of stock products (0 products)
✅ STATUS: WORKING
```

### 8. Reports
```bash
# Sales Report
curl -s "http://localhost:8000/api/admin/reports?type=sales&start_date=2025-10-01&end_date=2025-10-12" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Products Report
curl -s "http://localhost:8000/api/admin/reports?type=products&start_date=2025-10-01&end_date=2025-10-12" \
  -H "Authorization: Bearer YOUR_TOKEN"

✅ STATUS: WORKING
```

---

## 🧪 Complete Test Steps

### Step 1: Access Admin Login Page
1. Open browser and navigate to: http://localhost:5174/admin/login
2. You should see the "Admin Access" page with secure administrative login form

### Step 2: Login with Correct Credentials
1. Enter email: `admin@skbakers.com`
2. Enter password: `admin123456`
3. Click "Sign in to Admin"
4. **Expected Result:** Should redirect to `/admin` panel

### Step 3: Verify Admin Dashboard Loads
After successful login, you should see:
- Total Users count
- Total Products count
- Total Orders count
- Revenue statistics
- Recent orders list
- Low stock alerts

### Step 4: Test Admin Navigation
Navigate through these admin pages:
- `/admin` - Dashboard (main admin page)
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/users` - User management
- `/admin/customers` - Customer analytics
- `/admin/inventory` - Inventory management
- `/admin/analytics` - Advanced analytics
- `/admin/reports` - Reports generation

---

## 🔧 Troubleshooting

### Issue 1: "Invalid credentials" Error
**Symptoms:**
```
❌ Admin login failed: Invalid credentials
Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

**Solutions:**
1. ✅ **Use correct email:** `admin@skbakers.com` (NOT `admin@test.com`)
2. ✅ **Use correct password:** `admin123456`
3. ✅ **Check you're on admin login page:** http://localhost:5174/admin/login
4. ✅ **Clear browser cache and localStorage:**
   ```javascript
   // Open browser console and run:
   localStorage.clear();
   // Then refresh and try again
   ```

### Issue 2: Admin Panel Not Loading
**Solutions:**
1. Verify backend is running:
   ```bash
   curl http://localhost:8000/api/health
   ```
2. Verify admin token is valid:
   - Check browser localStorage for 'token'
   - Check browser console for errors
3. Verify you have admin role:
   ```bash
   curl http://localhost:8000/api/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Issue 3: 401 Unauthorized on Admin Endpoints
**Solutions:**
1. Ensure you're logged in as admin
2. Check token is included in request headers
3. Verify token hasn't expired (7 days validity)
4. Re-login if token is expired

### Issue 4: CORS Errors
**Solutions:**
1. Verify backend is on port 8000:
   ```bash
   netstat -ano | findstr :8000
   ```
2. Verify frontend is on port 5173/5174:
   ```bash
   # Should be running on localhost:5173 or localhost:5174
   ```
3. Check no hardcoded localhost:3001 references:
   ```bash
   grep -r "localhost:3001" src/
   # Should return nothing
   ```

---

## 📋 Pre-Flight Checklist

Before testing admin panel, ensure:

- ✅ MySQL is running on port 3306
  ```bash
  netstat -ano | findstr :3306
  ```

- ✅ PHP backend is running on port 8000
  ```bash
  cd php-backend
  php -S localhost:8000 index.php
  ```

- ✅ React frontend is running on port 5173
  ```bash
  cd ecommerce-frontend
  npm run dev
  ```

- ✅ Database has admin user
  ```bash
  mysql -u root u707629033_skbakers_main -e "SELECT email FROM users WHERE role='admin';"
  # Should return: admin@skbakers.com
  ```

- ✅ Admin password hash is correct
  ```bash
  mysql -u root u707629033_skbakers_main -e "SELECT password FROM users WHERE email='admin@skbakers.com';"
  # Should return: $2y$12$ZBIXh9Cy...
  ```

---

## 🎯 Current Database Status

### Users in Database (5 total)
1. **Admin User:**
   - ID: 1
   - Name: Admin
   - Email: admin@skbakers.com
   - Role: admin
   - Status: ✅ Active

2. **Test Users:**
   - testuser2@example.com (password: password123)
   - test@example.com (password: testpass123)
   - Plus 2 more test users from registration

### Products in Database (11 total)
- All products are active
- 1 product has low stock (≤5 units)
- 0 products are out of stock

### Orders in Database (0 total)
- No orders yet (this is normal for new installation)
- You can create test orders by:
  1. Logging in as test user
  2. Adding products to cart
  3. Completing checkout

---

## 🧪 Quick Test Script

You can test all admin endpoints at once with this script:

```bash
# Set your token (get it from login response)
TOKEN="YOUR_TOKEN_HERE"

echo "Testing Admin Panel Endpoints..."
echo ""

echo "1. Dashboard:"
curl -s http://localhost:8000/api/admin/dashboard -H "Authorization: Bearer $TOKEN" | grep -o '"success":[^,]*'

echo "2. Analytics:"
curl -s http://localhost:8000/api/admin/analytics -H "Authorization: Bearer $TOKEN" | grep -o '"success":[^,]*'

echo "3. Order Stats:"
curl -s http://localhost:8000/api/admin/order-stats -H "Authorization: Bearer $TOKEN" | grep -o '"success":[^,]*'

echo "4. User Stats:"
curl -s http://localhost:8000/api/admin/user-stats -H "Authorization: Bearer $TOKEN" | grep -o '"success":[^,]*'

echo "5. Users:"
curl -s http://localhost:8000/api/admin/users -H "Authorization: Bearer $TOKEN" | grep -o '"success":[^,]*'

echo "6. Customers:"
curl -s http://localhost:8000/api/admin/customers -H "Authorization: Bearer $TOKEN" | grep -o '"success":[^,]*'

echo "7. Inventory:"
curl -s http://localhost:8000/api/admin/inventory -H "Authorization: Bearer $TOKEN" | grep -o '"success":[^,]*'

echo ""
echo "All endpoints should return: \"success\":true"
```

---

## ✅ Summary

### What's Working
✅ Admin login with correct credentials (`admin@skbakers.com`)
✅ All 8 admin API endpoints responding correctly
✅ JWT authentication working
✅ Admin role verification working
✅ Dashboard statistics accurate
✅ Analytics data available
✅ Inventory tracking functional
✅ User management ready
✅ Reports generation working

### What Was Fixed
✅ Port changed from 3001 to 8000 (all files updated)
✅ Admin password hash updated to PHP-compatible format
✅ AuthContext response parsing fixed
✅ Session management fixed (no duplicate session_start)
✅ CORS headers configured correctly
✅ All deprecated warnings resolved

### Important Reminder
⚠️ **Always use `admin@skbakers.com` for admin login, NOT `admin@test.com`**

The error you saw was because you used an email that doesn't exist in the database. The correct admin email is `admin@skbakers.com`.

---

**Test Guide Generated:** October 12, 2025
**All Tests:** ✅ PASSING
**Admin Panel Status:** ✅ FULLY FUNCTIONAL
