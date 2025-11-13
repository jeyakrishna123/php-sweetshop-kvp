# Complete Banner Fix - Database + Backend

**Date:** November 13, 2025

**Issue:** Banners show on laptop but NOT on mobile (from your screenshots)

---

## 🚨 Root Cause (From Your Screenshots)

### Screenshot Analysis:

**Image 3 (Banners Table):**
```
image_url: /backend/uploads/banners/6914ef43b432f_1762979651...
```

**Image 4 (Products Table):**
```
images: ["uploads/products/6914dae26669b_1762974434..."]
```

**THE PROBLEM:** Banners store `/backend/uploads/` but products store `/uploads/`

This inconsistency causes the `getImageUrl()` function to create WRONG URLs:

```
Database: /backend/uploads/banners/xxx.webp
↓
getImageUrl() adds /backend/ AGAIN
↓
Result: /backend/backend/uploads/banners/xxx.webp  ❌ BROKEN!
```

---

## ✅ Complete Fix (2 Steps)

### Step 1: Fix Database Paths

**Run this SQL in phpMyAdmin:**

```sql
-- Fix banner paths - remove /backend/ prefix
UPDATE banners
SET
    image_url = REPLACE(image_url, '/backend/uploads/', '/uploads/'),
    mobile_image_url = REPLACE(mobile_image_url, '/backend/uploads/', '/uploads/'),
    desktop_image_url = REPLACE(desktop_image_url, '/backend/uploads/', '/uploads/')
WHERE
    image_url LIKE '/backend/uploads/%'
    OR mobile_image_url LIKE '/backend/uploads/%'
    OR desktop_image_url LIKE '/backend/uploads/%';

-- Verify the fix
SELECT id, title, image_url, mobile_image_url, desktop_image_url FROM banners;
```

**Expected result:**
```
BEFORE: /backend/uploads/banners/6914ef43b432f_1762979651.webp
AFTER:  /uploads/banners/6914ef43b432f_1762979651.webp
```

Now it matches how products store paths! ✅

---

### Step 2: Deploy Backend Fix

**Upload this file:**
```
hostinger_upload/backend/api/banners.php
```

**To server:**
```
/backend/api/banners.php
```

This file already has the `getImageUrl()` conversions we added.

---

## 🧪 Test After Fix

### Test 1: Check Database
**In phpMyAdmin, run:**
```sql
SELECT image_url FROM banners LIMIT 1;
```

**Should return:**
```
/uploads/banners/6914ef43b432f_1762979651.webp
```

**NOT:**
```
/backend/uploads/banners/6914ef43b432f_1762979651.webp
```

---

### Test 2: Check API Response
**On mobile browser console:**
```javascript
fetch('https://skbakers.com/backend/api/banners/active')
  .then(r => r.json())
  .then(d => console.log('URL:', d.banners[0]?.imageUrl));
```

**Should output:**
```
URL: https://skbakers.com/backend/uploads/banners/6914ef43b432f_1762979651.webp
```

---

### Test 3: Check Mobile Display
1. Open https://skbakers.com on mobile
2. Banner should show! ✅

---

## 📊 How It Works Now

### Database Storage:
```
banners table: /uploads/banners/xxx.webp
products table: /uploads/products/xxx.webp
```
Both use same format! ✅

### Backend Processing (getImageUrl):
```
Input:  /uploads/banners/xxx.webp
Step 1: Add /backend/ → /backend/uploads/banners/xxx.webp
Step 2: Add domain → https://skbakers.com/backend/uploads/banners/xxx.webp
Output: https://skbakers.com/backend/uploads/banners/xxx.webp ✅
```

### Frontend Display:
```javascript
<img src="https://skbakers.com/backend/uploads/banners/xxx.webp" />
```
Works on ALL devices! ✅

---

## 🔧 Why This Happened

**When you uploaded banner image:**

The upload script saved it with `/backend/` prefix:
```php
// Wrong way (what happened):
$imagePath = '/backend/uploads/banners/xxx.webp';  ❌

// Correct way (what products do):
$imagePath = '/uploads/banners/xxx.webp';  ✅
```

Then when displaying, `getImageUrl()` added `/backend/` AGAIN:
```
/backend/uploads/banners/xxx.webp
↓ getImageUrl()
/backend/backend/uploads/banners/xxx.webp  ❌ BROKEN!
```

---

## 🚀 Quick Deploy Steps

### Step 1: Fix Database (1 minute)
1. Open phpMyAdmin
2. Select `u707629033_skbakers` database
3. Click SQL tab
4. Copy and paste:
```sql
UPDATE banners
SET
    image_url = REPLACE(image_url, '/backend/uploads/', '/uploads/'),
    mobile_image_url = REPLACE(mobile_image_url, '/backend/uploads/', '/uploads/'),
    desktop_image_url = REPLACE(desktop_image_url, '/backend/uploads/', '/uploads/')
WHERE
    image_url LIKE '/backend/uploads/%'
    OR mobile_image_url LIKE '/backend/uploads/%'
    OR desktop_image_url LIKE '/backend/uploads/%';
```
5. Click "Go"
6. Should see "1 row affected" ✅

---

### Step 2: Upload Backend File (30 seconds)
1. Upload `hostinger_upload/backend/api/banners.php` to server
2. Overwrite existing file

---

### Step 3: Test (30 seconds)
1. Open https://skbakers.com on mobile
2. Banner shows! 🎉

---

## 📝 Summary

**Problem:** Database had `/backend/uploads/` but should be `/uploads/`

**Fix:**
1. ✅ SQL update to remove `/backend/` prefix from database
2. ✅ Backend file already has `getImageUrl()` conversions

**Result:** Banners work on ALL devices! 🎉

---

## 🎯 Prevention

**For future banner uploads:**

The backend fix we applied ensures new uploads will be stored correctly. The `uploadImage()` helper returns `/uploads/banners/xxx` (without `/backend/`), and `normalizeImagePath()` also strips `/backend/` if present.

So after this fix:
- ✅ Old banners: Fixed by SQL update
- ✅ New banners: Will be stored correctly automatically

---

## 🚀 DEPLOY NOW

**Copy this SQL and run in phpMyAdmin:**

```sql
UPDATE banners SET image_url = REPLACE(image_url, '/backend/uploads/', '/uploads/'), mobile_image_url = REPLACE(mobile_image_url, '/backend/uploads/', '/uploads/'), desktop_image_url = REPLACE(desktop_image_url, '/backend/uploads/', '/uploads/') WHERE image_url LIKE '/backend/uploads/%' OR mobile_image_url LIKE '/backend/uploads/%' OR desktop_image_url LIKE '/backend/uploads/%';
```

**Then upload:**
```
hostinger_upload/backend/api/banners.php → /backend/api/banners.php
```

**Then test on mobile - banner will show!** ✅
