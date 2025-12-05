# ⚡ QUICK FIX - Image Upload 414 Error

## 🎯 3 STEPS - 5 MINUTES

### 1️⃣ UPLOAD FILES (2 min)

Upload these 4 files via Hostinger File Manager:

| Local File | Upload To |
|------------|-----------|
| `hostinger_upload/backend/includes/helpers.php` | `public_html/backend/includes/helpers.php` |
| `TEST_BASE64_CONVERSION.php` | `public_html/backend/TEST_BASE64_CONVERSION.php` |
| `CHECK_UPLOAD_DIR.php` | `public_html/backend/CHECK_UPLOAD_DIR.php` |
| `FIX_BASE64_IMAGES.php` | `public_html/backend/FIX_BASE64_IMAGES.php` |

---

### 2️⃣ RUN TESTS (2 min)

Visit these URLs in order:

**A. Test Conversion:**
```
https://skbakers.com/backend/TEST_BASE64_CONVERSION.php
```
- Should show: "✅ Conversion SUCCEEDED!"
- If failed: Shows exact error and how to fix

**B. Check Directories:**
```
https://skbakers.com/backend/CHECK_UPLOAD_DIR.php
```
- Should show: "✅ ALL CHECKS PASSED"
- If failed: Follow fix instructions on page

**C. Fix Existing Products:**
```
https://skbakers.com/backend/FIX_BASE64_IMAGES.php
```
- Click "Fix All Base64 Images"
- Should show: "✅ Products Fixed: X products"

---

### 3️⃣ TEST (1 min)

1. Go to admin products page
2. Create new product with image
3. **Should work now!** ✅
4. No more 414 errors

---

## 🔧 MOST COMMON FIX

If tests fail, usually this fixes it:

**In Hostinger File Manager:**
1. Navigate to `public_html/`
2. Create folder: `uploads` (if missing)
3. Inside uploads, create: `products` (if missing)
4. Right-click `products` → Permissions → Set to **755** or **777**
5. Re-run tests above

---

## ✅ SUCCESS =

- TEST_BASE64_CONVERSION.php shows ✅ Conversion SUCCEEDED
- CHECK_UPLOAD_DIR.php shows ✅ ALL CHECKS PASSED
- New product images upload correctly
- No 414 errors in browser console
- Database has `/uploads/products/...` not `data:image...`

---

## 🔍 STILL NOT WORKING?

Check error log:
```
public_html/backend/logs/php-error.log
```

Look for lines with 🔍/✅/❌ indicators. They show exact error.

---

## 🔒 CLEANUP (After Success)

Delete these from server:
- `public_html/backend/TEST_BASE64_CONVERSION.php`
- `public_html/backend/CHECK_UPLOAD_DIR.php`
- `public_html/backend/FIX_BASE64_IMAGES.php`

---

**That's it!** 🎉
