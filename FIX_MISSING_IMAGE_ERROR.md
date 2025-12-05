# Fix Missing Image Error (422 Error)

**Error:** `GET https://skbakers.com/backend/uploads/menu-items/690f0b2fc68ec_1762593583.jpg 422`

**Product:** MILK

**Date:** November 13, 2025

---

## 🚨 What's Causing the Error

The database has a reference to an image file that **doesn't exist** on the server:

```
Product: MILK
Image in DB: /uploads/menu-items/690f0b2fc68ec_1762593583.jpg
File on Server: ❌ DOES NOT EXIST
Result: 422 Error (Unprocessable Content)
```

**Why this happens:**
- Image was deleted from server
- OR upload failed but database was updated
- OR image path was changed

---

## 🔧 Quick Fix - Option 1: Run SQL Query

**Run this SQL on your production database:**

```sql
-- Check which product has the missing image
SELECT id, name, images, thumbnail
FROM products
WHERE images LIKE '%690f0b2fc68ec_1762593583%'
   OR thumbnail LIKE '%690f0b2fc68ec_1762593583%';

-- Fix: Remove the missing image reference
UPDATE products
SET images = '[]'
WHERE images LIKE '%690f0b2fc68ec_1762593583%'
   OR thumbnail LIKE '%690f0b2fc68ec_1762593583%';

-- Also clear thumbnail if it references the missing image
UPDATE products
SET thumbnail = NULL
WHERE thumbnail LIKE '%690f0b2fc68ec_1762593583%';

-- Verify fix
SELECT id, name, images, thumbnail
FROM products
WHERE name LIKE '%MILK%';
```

---

## 🔧 Quick Fix - Option 2: Use PHP Script

We already created a script for this! Upload and run:

**File:** `hostinger_upload/backend/fix_missing_images.php`

**Steps:**
1. **Upload** `fix_missing_images.php` to `/backend/` folder on production
2. **Uncomment line 11** (remove the `// die...` line)
3. **Visit:** https://skbakers.com/backend/fix_missing_images.php
4. **Watch it auto-fix** the database
5. **Delete the file** after it's done (for security)

---

## 🔧 Quick Fix - Option 3: Admin Panel

**If you have admin access to edit products:**

1. Go to Admin Panel → Products
2. Find product "MILK"
3. Edit the product
4. Delete the broken image
5. Upload a new image
6. Save

---

## 🔍 Why Product Upload Works but Menu Items Doesn't

| Directory | Usage | Status |
|-----------|-------|--------|
| `/uploads/products/` | ✅ Product images | Working 100% |
| `/uploads/menu-items/` | ❌ Old menu items | **DEPRECATED - Don't use!** |
| `/uploads/banners/` | ✅ Banner images | Working 100% |
| `/uploads/popups/` | ✅ Popup images | Working 100% |

**The issue:**
- Products should use `/uploads/products/`
- This product has old `/uploads/menu-items/` reference
- That folder/image doesn't exist anymore

---

## ✅ Recommended Solution

**Run this SQL to clean ALL products:**

```sql
-- Find ALL products with menu-items references
SELECT id, name, images
FROM products
WHERE images LIKE '%menu-items%';

-- Fix: Remove ALL menu-items references
UPDATE products
SET images = '[]',
    thumbnail = NULL
WHERE images LIKE '%menu-items%'
   OR thumbnail LIKE '%menu-items%';

-- Verify: Should return 0 rows
SELECT COUNT(*) as remaining_issues
FROM products
WHERE images LIKE '%menu-items%'
   OR thumbnail LIKE '%menu-items%';
```

**Then:**
- Go to admin panel
- Re-upload images for affected products
- New images will use correct `/uploads/products/` folder

---

## 🔍 Check Other Missing Images

**Run this to find ALL missing image references:**

```sql
-- Check for other potentially missing images
SELECT
    id,
    name,
    images,
    CASE
        WHEN images LIKE '%menu-items%' THEN '❌ Old menu-items folder'
        WHEN images LIKE '%data:image%' THEN '❌ Base64 in database'
        WHEN images = '[]' OR images IS NULL THEN '⚠️ No images'
        ELSE '✅ OK'
    END as status
FROM products
WHERE images LIKE '%menu-items%'
   OR images LIKE '%data:image%'
   OR images = '[]'
   OR images IS NULL
ORDER BY status, name;
```

---

## 🎯 Quick Command (Choose One)

### Option A: Just Fix MILK Product
```sql
UPDATE products
SET images = '[]', thumbnail = NULL
WHERE images LIKE '%690f0b2fc68ec_1762593583%';
```

### Option B: Fix ALL Menu-Items References
```sql
UPDATE products
SET images = '[]', thumbnail = NULL
WHERE images LIKE '%menu-items%';
```

### Option C: Upload New Image via Admin
1. Admin Panel → Products → Edit MILK
2. Upload new image
3. Save
4. Done!

---

## 📊 After Fix

**Before:**
```json
{
  "id": 123,
  "name": "MILK",
  "images": ["/uploads/menu-items/690f0b2fc68ec_1762593583.jpg"],  // ❌ Missing file
  "thumbnail": "/uploads/menu-items/690f0b2fc68ec_1762593583.jpg"
}
```

**After:**
```json
{
  "id": 123,
  "name": "MILK",
  "images": [],  // ✅ Empty (ready for new upload)
  "thumbnail": null
}
```

**Then upload new image:**
```json
{
  "id": 123,
  "name": "MILK",
  "images": ["/uploads/products/673abc123_1732012345.jpg"],  // ✅ New image
  "thumbnail": "/uploads/products/673abc123_1732012345.jpg"
}
```

---

## 🚀 Fastest Solution (1 Minute)

**Copy this SQL and run it now:**

```sql
-- Fix MILK product and all menu-items references at once
UPDATE products
SET images = '[]', thumbnail = NULL
WHERE images LIKE '%menu-items%'
   OR thumbnail LIKE '%menu-items%';

-- Verify fix
SELECT
    COUNT(*) as products_fixed,
    'All menu-items references removed' as status
FROM products
WHERE images = '[]';
```

**Then:**
- Refresh your website
- Error gone! ✅
- Product shows placeholder instead of broken image
- Re-upload image via admin panel when ready

---

## 💡 Prevention

**To prevent this in the future:**

1. ✅ **Always use product upload endpoints** (not menu-items)
2. ✅ **Don't manually delete files** from uploads folder
3. ✅ **Use admin panel** to delete products (cleans up files)
4. ✅ **Run periodic checks** for missing files

**Check for missing files periodically:**
```sql
-- Run this monthly to find issues
SELECT id, name, images
FROM products
WHERE images != '[]'
  AND images NOT LIKE '%/uploads/products/%'
ORDER BY updated_at DESC;
```

---

## 🎯 Summary

**Problem:** Product "MILK" references non-existent image file

**Cause:** Database has old `/uploads/menu-items/` reference

**Fix:** Run SQL to clear the reference (1 minute)

**Result:** Error gone, product shows placeholder

**Next:** Upload new image via admin panel

---

**Quick SQL to run NOW:**
```sql
UPDATE products
SET images = '[]', thumbnail = NULL
WHERE images LIKE '%690f0b2fc68ec_1762593583%';
```

**Then refresh browser - error will be gone!** ✅
