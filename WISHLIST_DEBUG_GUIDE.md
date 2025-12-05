# Wishlist Add Functionality - Debug Guide

## Changes Made

### 1. Frontend (ProductDetails.jsx)
Added comprehensive debug logging to `handleWishlistToggle()`:

```javascript
✅ Logs product ID and type before adding
✅ Logs full product object for inspection
✅ Added validation to check if product exists
✅ Better error messages
```

**Lines modified:** 300-350

### 2. Backend (wishlist.php)
Added detailed server-side logging to `addToWishlist()`:

```php
✅ Logs request data received
✅ Logs authenticated user ID
✅ Logs product ID after conversion to integer
✅ Logs whether product was found
✅ Logs success/failure at each step
```

**Lines modified:** 126-186

## How to Test & Debug

### Step 1: Open Browser Console
1. Open your product details page (e.g., http://localhost:5173/product/1)
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. Clear the console

### Step 2: Try Adding to Wishlist
1. Make sure you're logged in
2. Click the heart/wishlist icon
3. Watch the console for logs

### Expected Frontend Logs:

**If Successful:**
```
❤️ Adding to wishlist, product._id: 1 type: number
❤️ Full product object: {_id: 1, name: "...", ...}
✅ Added to wishlist: {success: true, ...}
```

**If Product ID Missing:**
```
❌ No product or product ID available
```

**If Error:**
```
❌ Wishlist toggle failed: Error: ...
❌ Error details: {message: "...", response: {...}, status: 404}
```

### Step 3: Check Backend Logs

**Location:** Check your PHP error log file (usually in `php-backend/logs/` or system error log)

**Expected Backend Logs:**

**If Successful:**
```
🔍 addToWishlist - Request data: {"productId":1}
🔍 addToWishlist - Auth user ID: 2
🔍 addToWishlist - Product ID (converted to int): 1
🔍 addToWishlist - Product found: YES
🔍 addToWishlist - Product name: Elegant Wedding Cake
✅ addToWishlist - Successfully added to wishlist
```

**If Product Not Found:**
```
🔍 addToWishlist - Product ID (converted to int): 999
🔍 addToWishlist - Product found: NO
❌ addToWishlist - Product not found or inactive for ID: 999
```

**If Already in Wishlist:**
```
⚠️ addToWishlist - Product already in wishlist
```

## Common Issues & Solutions

### Issue 1: Product ID is undefined
**Symptom:** Frontend console shows `product._id: undefined`

**Solution:** The product data isn't loading correctly
- Check `fetchProduct()` in ProductDetails.jsx
- Verify backend returns `id` field in product response

### Issue 2: Product not found (404)
**Symptom:** Backend logs show "Product found: NO"

**Possible causes:**
1. Product ID is 0 (conversion failed)
2. Product doesn't exist in database
3. Product is inactive (`is_active = 0`)

**Solution:** Check backend logs for the actual ID being queried

### Issue 3: Authentication error (401)
**Symptom:** Error before any wishlist logs appear

**Solution:** User is not logged in or token expired
- Check if user is logged in
- Verify auth token in axios headers

### Issue 4: Already in wishlist (409)
**Symptom:** Backend logs show "Product already in wishlist"

**Solution:** This is expected behavior - remove it first, then add again

## Testing Checklist

- [ ] Product details page loads correctly
- [ ] Product ID is visible in console when page loads
- [ ] User is logged in
- [ ] Clicking wishlist button shows loading state
- [ ] Browser console shows "Adding to wishlist" log
- [ ] Backend PHP logs show request received
- [ ] Success message appears (or specific error message)
- [ ] Wishlist icon changes state (filled vs outline)
- [ ] Product appears in /wishlist page

## Quick Test Products

Based on the database check, these products exist:
- Product ID 1: "Elegant Wedding Cake"
- Product ID 2: "Strawberry Vanilla Cupcake"
- Product ID 3: "Red Velvet Cake"

Try navigating to:
- http://localhost:5173/product/1
- http://localhost:5173/product/2

## Manual Database Check

To verify wishlist entries directly:

```sql
SELECT w.*, u.name as user_name, p.name as product_name
FROM wishlist w
LEFT JOIN users u ON w.user_id = u.id
LEFT JOIN products p ON w.product_id = p.id
WHERE u.email = 'your-email@example.com';
```

Or use the test script:
```bash
php test_wishlist_add.php
```

## Next Steps

After testing:
1. Share the **exact console logs** from browser
2. Share the **backend PHP logs** if available
3. Specify what happens when you click the wishlist button
4. Note any error messages that appear

This will help identify the exact issue!
