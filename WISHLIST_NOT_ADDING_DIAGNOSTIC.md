# Wishlist Not Adding Products - Diagnostic Guide

**Issue:** Products are not being added to wishlist in production
**Status:** 🔍 **INVESTIGATING**

---

## Possible Causes

### 1. Wishlist Table Doesn't Exist ⚠️ MOST LIKELY

**Check:**
The wishlist table might not exist in the production database.

**Solution:**
Create the wishlist table manually via phpMyAdmin or SQL:

```sql
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_wishlist (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**How to check if table exists:**
1. Login to Hostinger control panel
2. Go to phpMyAdmin
3. Select database: `u707629033_skbakers`
4. Look for `wishlist` table in table list
5. If it doesn't exist, run the SQL above

---

### 2. Authentication Issues

**Symptoms:**
- Getting 401 errors
- User not logged in
- Token expired

**Debug in Browser Console (F12):**
```javascript
// Check if user is logged in
console.log('User:', localStorage.getItem('token'));

// Check authorization header
// Look for: "Authorization: Bearer {token}"
```

**Backend Logs:**
Look for these messages in `backend/logs/php-error.log`:
```
❌ addToWishlist - Auth error: ...
🔍 addToWishlist - Auth user ID: [should show number]
```

**Solution:**
- Make sure user is logged in
- Check if token is being sent in Authorization header
- Token might be expired - try logging in again

---

### 3. Product Not Found

**Symptoms:**
- Getting 404 errors
- Toast message: "Product not found or inactive"

**Backend Logs:**
```
❌ addToWishlist - Product not found or inactive for ID: X
```

**Possible Reasons:**
- Product ID is wrong
- Product is marked as inactive (is_active = 0)
- Product doesn't exist in database

**Solution:**
Check in database:
```sql
SELECT id, name, is_active FROM products WHERE id = {PRODUCT_ID};
```

Make sure:
- Product exists
- `is_active = 1`

---

### 4. Database Connection Error

**Symptoms:**
- Getting 500 errors
- No response from server

**Backend Logs:**
```
❌ addToWishlist - Failed to insert into wishlist table
```

**Check:**
1. Database connection is working
2. Database credentials are correct in `config/config.php`:
   ```php
   DB_HOST = 'localhost'
   DB_NAME = 'u707629033_skbakers'
   DB_USER = 'u707629033_sksweets'
   DB_PASS = 'Skbakers@123'
   ```

**Test Database Connection:**
Visit: `https://skbakers.com/api`
Should return JSON with API info (proves database connection works)

---

### 5. Frontend Not Receiving Response

**Symptoms:**
- Click heart icon
- No toast message appears
- Loading spinner doesn't stop

**Debug in Browser Console (F12):**
```javascript
// Look for these logs:
❤️ Adding to wishlist, product._id: 123
🔍 Axios Request: POST /api/wishlist/add
✅ Axios Response: 200 /api/wishlist/add  // ← Should see this

// Or error:
❌ Axios Response Error: XXX /api/wishlist/add
```

**Network Tab (F12 → Network):**
1. Click heart icon
2. Look for request to `/api/wishlist/add`
3. Check response:
   - **Status:** Should be 201 (Created) or 409 (Conflict)
   - **Response:** Should see JSON with success: true

**Solution:**
- If no request is sent: Frontend issue
- If request sent but no response: Backend issue
- If response received but not handled: Check console errors

---

## Step-by-Step Debugging Guide

### Step 1: Open Browser Console
```
1. Press F12
2. Go to Console tab
3. Clear console (trash icon)
```

### Step 2: Try Adding to Wishlist
```
1. Click heart icon on any product
2. Watch console for messages
```

### Step 3: Check What You See

**Scenario A: Success Messages**
```
✅ Added to wishlist
```
**Then:** Product should be in wishlist. If not, check:
- Visit `/wishlist` page
- Refresh page
- Check if product appears

**Scenario B: 409 Error**
```
⚠️ Product already in wishlist, syncing state
```
**Then:** Product is already in wishlist (working correctly)

**Scenario C: 404 Error**
```
❌ Product not found
```
**Then:** Product doesn't exist or is inactive
**Solution:** Check database for product

**Scenario D: 401 Error**
```
❌ Authentication required
```
**Then:** User not logged in
**Solution:** Login again

**Scenario E: 500 Error**
```
❌ Failed to add to wishlist
```
**Then:** Database error
**Solution:** Check backend logs, check wishlist table exists

**Scenario F: No Response**
```
(Loading spinner doesn't stop, no message)
```
**Then:** Request not reaching backend or response not coming back
**Solution:** Check Network tab

### Step 4: Check Network Tab
```
1. F12 → Network tab
2. Filter: XHR or Fetch
3. Click heart icon
4. Look for: POST /api/wishlist/add
5. Click on request
6. Check:
   - Status Code (should be 200, 201, 409, 404, etc.)
   - Response tab (should see JSON)
   - Headers tab (check Authorization header)
```

### Step 5: Check Backend Logs
```
Location: backend/logs/php-error.log
Or via Hostinger: File Manager → backend/logs/php-error.log

Look for recent entries with:
🔍 addToWishlist - ...
✅ addToWishlist - Successfully added to wishlist
❌ addToWishlist - ...
```

---

## Quick Fixes

### Fix 1: Create Wishlist Table (Most Important!)

**Via phpMyAdmin:**
```
1. Login to Hostinger
2. Go to Databases → phpMyAdmin
3. Select database: u707629033_skbakers
4. Click SQL tab
5. Paste this SQL:
```

```sql
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_wishlist (user_id, product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

```
6. Click "Go" to execute
7. Check if table appears in table list
```

**Also add wishlist_count to users table:**
```sql
ALTER TABLE users ADD COLUMN wishlist_count INT DEFAULT 0;
```

### Fix 2: Clear Browser Cache
```
1. Ctrl+Shift+Delete
2. Select "Cached images and files"
3. Clear data
4. Hard reload (Ctrl+F5)
```

### Fix 3: Re-login
```
1. Logout
2. Clear localStorage (Console: localStorage.clear())
3. Login again
4. Try adding to wishlist
```

### Fix 4: Check Product is Active
```sql
-- In phpMyAdmin, run:
UPDATE products SET is_active = 1 WHERE is_active = 0;
```

---

## Expected Behavior

### When Adding Product to Wishlist:

**Frontend (Browser Console):**
```
❤️ Adding to wishlist, product._id: 123
🔍 Axios Request: POST /api/wishlist/add
🔍 Axios Full URL: https://skbakers.com/api/wishlist/add
✅ Axios Response: 201 /api/wishlist/add
✅ Added to wishlist: {success: true, ...}
```

**Backend (Error Log):**
```
🔍 addToWishlist - Request data: {"productId":123}
🔍 addToWishlist - Auth user ID: 1
🔍 addToWishlist - Product ID (converted to int): 123
🔍 addToWishlist - Product found: YES
🔍 addToWishlist - Product name: Chocolate Cake
✅ addToWishlist - Successfully added to wishlist
```

**User Sees:**
```
✅ Green toast message: "Added to wishlist"
❤️ Heart icon fills with color
```

### When Removing from Wishlist:

**Frontend:**
```
🗑️ Removing from wishlist, product._id: 123
✅ Removed from wishlist
```

**User Sees:**
```
✅ Green toast: "Removed from wishlist"
🤍 Heart icon becomes outline
```

---

## Test Checklist

After applying fixes, test:

- [ ] Login to website
- [ ] Navigate to any product
- [ ] Click heart icon (empty)
- [ ] Expected: "Added to wishlist" success toast
- [ ] Heart icon should fill
- [ ] Navigate to /wishlist page
- [ ] Product should appear in list
- [ ] Click X to remove
- [ ] Expected: Product removed
- [ ] Navigate back to product
- [ ] Heart should be empty again
- [ ] Click heart again
- [ ] Expected: Works correctly

---

## What Information to Provide

If still not working, please provide:

**1. Browser Console Log:**
```
Copy all messages from console when clicking heart
```

**2. Network Tab:**
```
Status code: ???
Response: {copy JSON response}
Request Payload: {copy request data}
```

**3. Backend Error Log:**
```
Last 20 lines from backend/logs/php-error.log
```

**4. What You See:**
```
- What toast message appears (if any)?
- Does heart icon change?
- Is product in wishlist when you visit /wishlist?
```

**5. Database Check:**
```sql
-- Run in phpMyAdmin:
SHOW TABLES LIKE 'wishlist';
SELECT * FROM wishlist LIMIT 5;
```

---

## Most Likely Issue: Wishlist Table Missing ⚠️

Based on the symptoms, the most likely cause is:

**The `wishlist` table doesn't exist in the production database.**

**Solution:**
1. Login to Hostinger phpMyAdmin
2. Select database `u707629033_skbakers`
3. Run the CREATE TABLE SQL above
4. Try adding to wishlist again

This is the most common issue when deploying to a new server.

---

**Next Steps:**
1. Check if wishlist table exists
2. Create table if missing
3. Try adding product again
4. Provide console logs if still not working
