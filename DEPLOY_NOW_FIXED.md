# 🚨 CRITICAL FIX - Deploy These Files NOW

## The Problem You're Facing

**Popup not showing** because of this bug in the code:
```javascript
// OLD CODE (BROKEN):
const notExpired = new Date(popup.endDate) > new Date();
// If endDate is null, this returns FALSE, so popup never shows!

// NEW CODE (FIXED):
const notExpired = !popup.endDate || new Date(popup.endDate) > new Date();
// If endDate is null, popup is considered not expired (no expiration)
```

---

## ⚡ Quick Deploy (3 Steps)

### STEP 1: Run Database Migration

**Go to phpMyAdmin → SQL Tab → Paste and Run:**

```sql
-- Add advanced popup fields
ALTER TABLE `offer_popups`
ADD COLUMN `trigger_type` VARCHAR(50) DEFAULT 'page_load' AFTER `show_on_homepage`;

ALTER TABLE `offer_popups`
ADD COLUMN `show_on_pages` JSON DEFAULT NULL AFTER `trigger_type`;

ALTER TABLE `offer_popups`
ADD COLUMN `show_delay` INT DEFAULT 2000 AFTER `show_on_pages`;

ALTER TABLE `offer_popups`
ADD COLUMN `max_shows_per_session` INT DEFAULT 1 AFTER `show_delay`;
```

**If you get "Duplicate column" error**: That's OK, skip to next step.

---

### STEP 2: Upload Backend File

**File:** `hostinger_upload/backend/api/offer-popups.php`
**Upload to:** `/public_html/backend/api/offer-popups.php`

---

### STEP 3: Upload Frontend Files

**File 1:** `hostinger_upload/frontend/assets/index-Dp4k-zl6.js`
**Upload to:** `/public_html/assets/index-Dp4k-zl6.js`

**File 2:** `hostinger_upload/frontend/index.html`
**Upload to:** `/public_html/index.html`

---

## 🧹 After Upload - Clear Cache

1. **Clear browser cache**: `Ctrl + F5`
2. **Clear localStorage** (console): `localStorage.removeItem('offerPopups');`
3. **Visit admin panel**: `https://skbakers.com/admin/offer-popups`

---

## ✅ Test - Popup Should Show Now!

1. Go to `https://skbakers.com/`
2. Wait 2 seconds
3. **Popup appears!** ✅

---

**NEW BUILD FILE**: `index-Dp4k-zl6.js` (CRITICAL FIX INCLUDED)
