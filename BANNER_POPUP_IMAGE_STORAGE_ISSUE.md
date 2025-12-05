# Banner & Popup Image Storage Issue - CRITICAL FIX NEEDED

**Date:** November 13, 2025
**Priority:** 🔴 HIGH
**Status:** ❌ INCORRECT STORAGE FORMAT DETECTED

---

## 🚨 Issue Summary

**Problem:** Banners and Popups are storing images with `/backend/` prefix in database, while Products store them correctly with `/uploads/` prefix only.

**Impact:**
- ❌ **Inconsistent database format** across different image types
- ❌ **Harder to migrate/change domains** (hardcoded `/backend/` in database)
- ⚠️ **Works in production** but violates best practices
- ⚠️ **Database bloat** (longer paths than necessary)

---

## 📊 Current Storage Comparison

### ✅ Products (CORRECT FORMAT):

**Storage in Database:**
```json
{
  "images": ["\/uploads\/products\/xxx.webp"],
  "thumbnail": "\/uploads\/products\/xxx.webp"
}
```

**Code (products.php:1128-1150):**
```php
// Products use normalizeImagePath() which strips /backend/ prefix
$normalizedImages = [];
foreach ($imagesArray as $img) {
    $imageUrl = is_string($img) ? $img : ($img['url'] ?? '');
    if (!empty($imageUrl)) {
        // normalizeImagePath converts: /backend/uploads/xxx -> /uploads/xxx
        $normalizedPath = normalizeImagePath($imageUrl, 'products');
        if ($normalizedPath) {
            $normalizedImages[] = $normalizedPath;
        }
    }
}

$images = json_encode($normalizedImages);
// Result: ["\/uploads\/products\/xxx.webp"]
```

**Why This Is Correct:**
- ✅ Stores relative path only
- ✅ `getImageUrl()` adds `/backend/` prefix on retrieval
- ✅ Easy to change domain/structure later
- ✅ Smaller database size

---

### ❌ Banners (INCORRECT FORMAT):

**Storage in Database:**
```sql
image_url = '/backend/uploads/banners/xxx.jpg'
mobile_image_url = '/backend/uploads/banners/yyy.jpg'
desktop_image_url = '/backend/uploads/banners/zzz.jpg'
```

**Code (banners.php:274-295):**
```php
// Banners store /backend/ prefix directly (WRONG!)
if (move_uploaded_file($_FILES['mobileImage']['tmp_name'], $filepath)) {
    // ❌ Storing /backend/ prefix in database
    $mobileImageUrl = '/backend/uploads/banners/' . $filename;
    error_log("✅ Mobile image uploaded: $mobileImageUrl");
}

if (move_uploaded_file($_FILES['desktopImage']['tmp_name'], $filepath)) {
    // ❌ Storing /backend/ prefix in database
    $desktopImageUrl = '/backend/uploads/banners/' . $filename;
    error_log("✅ Desktop image uploaded: $desktopImageUrl");
}

// ❌ Database stores: /backend/uploads/banners/xxx.jpg
$stmt = $db->prepare("
    INSERT INTO banners (title, subtitle, image_url, mobile_image_url, desktop_image_url, ...)
    VALUES (?, ?, ?, ?, ?, ...)
");
$stmt->execute([$title, $description, $imageUrl, $mobileImageUrl, $desktopImageUrl, ...]);
```

**Why This Is Wrong:**
- ❌ Hardcodes `/backend/` in database
- ❌ Inconsistent with products table
- ❌ Makes domain changes harder
- ❌ Unnecessary database bloat

---

### ❌ Popups (INCORRECT FORMAT):

**Storage in Database:**
```sql
image_url = '/uploads/popups/xxx.webp'  -- OR --
image_url = 'https://skbakers.com/backend/uploads/popups/xxx.webp'
```

**Code (offer-popups.php:250):**
```php
// Popups accept imageUrl from frontend without normalization
$imageUrl = isset($data['imageUrl']) ? sanitizeInput($data['imageUrl']) : null;

// ❌ No normalization - stores whatever frontend sends
$stmt = $db->prepare("
    INSERT INTO offer_popups (title, description, image_url, ...)
    VALUES (?, ?, ?, ...)
");
$stmt->execute([$title, $description, $imageUrl, ...]);
```

**Current Behavior:**
- If frontend sends `/uploads/popups/xxx.webp` → stores as is ✅
- If frontend sends `https://skbakers.com/backend/uploads/popups/xxx.webp` → stores full URL ❌
- If frontend sends `/backend/uploads/popups/xxx.webp` → stores with /backend/ ❌

**Why This Is Wrong:**
- ❌ Inconsistent storage (depends on frontend input)
- ❌ Can store full URLs in database
- ❌ No validation/normalization

---

## 🔧 Required Fixes

### Fix #1: Banner Image Storage

**File:** `hostinger_upload/backend/api/banners.php`

**Lines 274-296 - Change From:**
```php
if (move_uploaded_file($_FILES['mobileImage']['tmp_name'], $filepath)) {
    // ❌ WRONG: Storing /backend/ prefix
    $mobileImageUrl = '/backend/uploads/banners/' . $filename;
    error_log("✅ Mobile image uploaded: $mobileImageUrl");
}

if (move_uploaded_file($_FILES['desktopImage']['tmp_name'], $filepath)) {
    // ❌ WRONG: Storing /backend/ prefix
    $desktopImageUrl = '/backend/uploads/banners/' . $filename;
    error_log("✅ Desktop image uploaded: $desktopImageUrl");
}
```

**Lines 274-296 - Change To:**
```php
if (move_uploaded_file($_FILES['mobileImage']['tmp_name'], $filepath)) {
    // ✅ CORRECT: Store relative path without /backend/
    $mobileImageUrl = '/uploads/banners/' . $filename;
    error_log("✅ Mobile image uploaded: $mobileImageUrl");
}

if (move_uploaded_file($_FILES['desktopImage']['tmp_name'], $filepath)) {
    // ✅ CORRECT: Store relative path without /backend/
    $desktopImageUrl = '/uploads/banners/' . $filename;
    error_log("✅ Desktop image uploaded: $desktopImageUrl");
}
```

**Explanation:**
- Remove `/backend/` from stored path
- `getImageUrl()` will add it back on retrieval
- Consistent with products table
- Existing `getImageUrl()` in retrieval already handles this correctly (banners.php:178, 220)

---

### Fix #2: Popup Image Storage

**File:** `hostinger_upload/backend/api/offer-popups.php`

**Lines 249-250 - Change From:**
```php
// ❌ WRONG: No normalization
$imageUrl = isset($data['imageUrl']) ? sanitizeInput($data['imageUrl']) : null;
```

**Lines 249-250 - Change To:**
```php
// ✅ CORRECT: Normalize image path before storing
$imageUrl = isset($data['imageUrl']) ? normalizeImagePath(sanitizeInput($data['imageUrl']), 'popups') : null;
```

**Also Update Lines 345-347 in updateOfferPopup():**

**Change From:**
```php
if (isset($data['imageUrl'])) {
    $updates[] = "image_url = ?";
    $params[] = sanitizeInput($data['imageUrl']);
}
```

**Change To:**
```php
if (isset($data['imageUrl'])) {
    $updates[] = "image_url = ?";
    $params[] = normalizeImagePath(sanitizeInput($data['imageUrl']), 'popups');
}
```

**Explanation:**
- Use `normalizeImagePath()` helper (same as products)
- Converts full URLs to relative paths
- Strips `/backend/` prefix if present
- Auto-converts base64 to files
- Consistent with products table

---

## 📋 Database Migration (Optional)

If you want to clean up existing data in production:

### Clean Banners Table:

```sql
-- Check current banner image paths
SELECT id, image_url, mobile_image_url, desktop_image_url
FROM banners
WHERE image_url LIKE '%/backend/%'
   OR mobile_image_url LIKE '%/backend/%'
   OR desktop_image_url LIKE '%/backend/%';

-- Fix: Remove /backend/ prefix from all banner images
UPDATE banners
SET image_url = REPLACE(image_url, '/backend/uploads/', '/uploads/')
WHERE image_url LIKE '%/backend/uploads/%';

UPDATE banners
SET mobile_image_url = REPLACE(mobile_image_url, '/backend/uploads/', '/uploads/')
WHERE mobile_image_url LIKE '%/backend/uploads/%';

UPDATE banners
SET desktop_image_url = REPLACE(desktop_image_url, '/backend/uploads/', '/uploads/')
WHERE desktop_image_url LIKE '%/backend/uploads/%';

-- Verify fix
SELECT id, image_url, mobile_image_url, desktop_image_url
FROM banners;
```

### Clean Popups Table:

```sql
-- Check current popup image paths
SELECT id, title, image_url
FROM offer_popups
WHERE image_url LIKE '%/backend/%'
   OR image_url LIKE 'http%';

-- Fix: Remove /backend/ prefix
UPDATE offer_popups
SET image_url = REPLACE(image_url, '/backend/uploads/', '/uploads/')
WHERE image_url LIKE '%/backend/uploads/%';

-- Fix: Convert full URLs to relative paths
UPDATE offer_popups
SET image_url = SUBSTRING(image_url, LOCATE('/uploads/', image_url))
WHERE image_url LIKE 'http%'
  AND LOCATE('/uploads/', image_url) > 0;

-- Verify fix
SELECT id, title, image_url
FROM offer_popups;
```

---

## 🧪 Testing After Fix

### Test Banner Upload:
1. Create new banner with mobile/desktop images
2. Check database: `SELECT * FROM banners ORDER BY id DESC LIMIT 1;`
3. **Expected:** `image_url = '/uploads/banners/xxx.jpg'` (no /backend/)
4. Check frontend displays correctly

### Test Popup Upload:
1. Upload popup image via `/api/upload/popup-image`
2. Create popup with uploaded image
3. Check database: `SELECT * FROM offer_popups ORDER BY id DESC LIMIT 1;`
4. **Expected:** `image_url = '/uploads/popups/xxx.webp'` (no /backend/, no full URL)
5. Check frontend displays correctly

### Test Existing Data:
1. Retrieve existing banners: `GET /api/banners`
2. **Expected:** Images display correctly (getImageUrl adds /backend/)
3. Retrieve existing popups: `GET /api/offer-popups`
4. **Expected:** Images display correctly

---

## 📊 Impact Analysis

### Before Fix:

**Database Content:**
```sql
-- Products (correct)
images: ["\/uploads\/products\/xxx.webp"]

-- Banners (wrong)
image_url: '/backend/uploads/banners/xxx.jpg'

-- Popups (inconsistent)
image_url: '/uploads/popups/xxx.webp'  -- OR --
image_url: 'https://skbakers.com/backend/uploads/popups/xxx.webp'
```

### After Fix:

**Database Content:**
```sql
-- Products
images: ["\/uploads\/products\/xxx.webp"]

-- Banners ✅ FIXED
image_url: '/uploads/banners/xxx.jpg'

-- Popups ✅ FIXED
image_url: '/uploads/popups/xxx.webp'
```

**All Consistent!** ✅

---

## 🎯 Why This Matters

### Best Practices:
1. ✅ **Separation of Concerns** - Storage format separate from display format
2. ✅ **DRY Principle** - One place to manage URL construction (getImageUrl)
3. ✅ **Maintainability** - Easy to change domain/structure
4. ✅ **Consistency** - All tables use same format

### Real-World Scenarios:
1. **Domain Change:** If you change from `skbakers.com` to `skbakers.in`
   - Products: ✅ Just update BASE_URL constant
   - Banners (before fix): ❌ Need to update all database records
   - Banners (after fix): ✅ Just update BASE_URL constant

2. **CDN Integration:** If you move images to CDN
   - Products: ✅ Just update getImageUrl() function
   - Banners (before fix): ❌ Need to update all database records
   - Banners (after fix): ✅ Just update getImageUrl() function

3. **Subfolder Change:** If `/backend/` moves to `/api/`
   - Products: ✅ Just update getImageUrl() function
   - Banners (before fix): ❌ Need to update all database records
   - Banners (after fix): ✅ Just update getImageUrl() function

---

## 🚀 Implementation Steps

1. ✅ Backup database before changes
2. ✅ Apply code fixes to banners.php (lines 276, 294)
3. ✅ Apply code fixes to offer-popups.php (lines 250, 347)
4. ✅ Test with new uploads
5. ⚠️ Optional: Run migration SQL to clean existing data
6. ✅ Verify all images display correctly

---

## 📝 Summary

**Issue:** Banners and Popups store images inconsistently compared to Products

**Root Cause:** Missing `normalizeImagePath()` call in banner/popup creation

**Fix:**
- Remove `/backend/` from banner upload paths
- Add `normalizeImagePath()` to popup creation/update

**Result:** All image types store relative paths consistently (`/uploads/{type}/xxx.ext`)

**Status:** 🔴 **FIX REQUIRED** - Currently works but violates best practices

---

**Next Steps:** Apply the code fixes in banners.php and offer-popups.php, then optionally run the database migration to clean existing data.
