# Complete Offer Popup End-to-End Deployment Guide

## 🎯 What Was Fixed

This deployment includes a **COMPLETE END-TO-END FIX** for the offer popup system with:

1. ✅ **Database Migration** - Added missing fields for advanced popup features
2. ✅ **Backend API Updates** - Full CRUD support for all popup fields
3. ✅ **Frontend Form Updates** - Send all required fields to backend
4. ✅ **Data Normalization** - Proper field mapping (snake_case ↔ camelCase)
5. ✅ **Boolean Conversion** - Fix for `isActive` type mismatch (1/0 → true/false)
6. ✅ **Component Integration** - Popup shows on Home, Product Details, Product Listing pages
7. ✅ **Field Mapping** - All database fields properly mapped and returned by API

---

## 📋 Files to Upload (In Order)

### **STEP 1: Database Migration (DO THIS FIRST)**

**File**: `php-backend/database/add-popup-advanced-fields.sql`

**Upload to**: Run in phpMyAdmin → SQL tab

**SQL Content**:
```sql
-- Add trigger_type field (page_load or click_specific_pages)
ALTER TABLE `offer_popups`
ADD COLUMN `trigger_type` VARCHAR(50) DEFAULT 'page_load' AFTER `show_on_homepage`;

-- Add show_on_pages field (JSON array of page names)
ALTER TABLE `offer_popups`
ADD COLUMN `show_on_pages` JSON DEFAULT NULL AFTER `trigger_type`;

-- Add show_delay field (milliseconds delay before showing)
ALTER TABLE `offer_popups`
ADD COLUMN `show_delay` INT DEFAULT 2000 AFTER `show_on_pages`;

-- Add max_shows_per_session field (how many times to show per session)
ALTER TABLE `offer_popups`
ADD COLUMN `max_shows_per_session` INT DEFAULT 1 AFTER `show_delay`;
```

**How to Run**:
1. Go to phpMyAdmin
2. Select your database: `u707629033_skbakers`
3. Click "SQL" tab
4. Copy and paste the SQL above
5. Click "Go"
6. Verify: Run `DESCRIBE offer_popups;` to see new columns

**Expected Result**:
```
✅ Query OK, 0 rows affected (X.XX sec)
Records: 0  Duplicates: 0  Warnings: 0
```

---

### **STEP 2: Backend API Update**

**File**: `hostinger_upload/backend/api/offer-popups.php`

**Upload to**: `/public_html/backend/api/offer-popups.php`

**What Changed**:
- ✅ Added handling for `trigger_type`, `show_on_pages`, `show_delay`, `maxShowsPerSession`
- ✅ CREATE: Inserts new fields into database
- ✅ UPDATE: Updates new fields
- ✅ GET Active: Returns new fields (including `start_date`, `end_date`)
- ✅ GET All: Returns all fields with proper structure

**Key Updates**:
- Line 224-228: Parse new fields from request
- Line 305-308: INSERT statement includes new fields
- Line 491-507: UPDATE supports new fields
- Line 122-124: SELECT includes all advanced fields

---

### **STEP 3: Frontend Files**

#### **3a. JavaScript Bundle**

**File**: `hostinger_upload/frontend/assets/index-eQZ4qslo.js`

**Upload to**: `/public_html/assets/index-eQZ4qslo.js`

**Size**: 1,342.19 kB (gzipped: 291.04 kB)

**What Changed**:
- ✅ AdminOfferPopups: Sends all fields (title, description, button fields, etc.)
- ✅ AdminOfferPopups: Normalizes all database fields with proper type conversion
- ✅ AdminOfferPopups: Parses JSON fields (show_on_pages)
- ✅ ProductDetails: Renders WelcomeOfferPopup component
- ✅ ProductListing: Renders WelcomeOfferPopup component
- ✅ Boolean conversion: `is_active: 1` → `isActive: true`

#### **3b. HTML Index**

**File**: `hostinger_upload/frontend/index.html`

**Upload to**: `/public_html/index.html`

**What Changed**:
- ✅ Updated script reference to new bundle: `index-eQZ4qslo.js`

---

## 🔄 Post-Deployment Steps

### 1. Clear Browser Cache
```
Press: Ctrl + Shift + Delete
Or: Ctrl + F5 (hard refresh)
```

### 2. Clear localStorage (Important!)

Open browser console (F12) and run:
```javascript
localStorage.removeItem('offerPopups');
sessionStorage.clear();
```

### 3. Go to Admin Panel

Visit: `https://skbakers.com/admin/offer-popups`

This will:
- Fetch fresh data from database with new fields
- Save to localStorage with correct structure
- Normalize all data types (boolean, JSON, etc.)

### 4. Verify Database Migration

In phpMyAdmin, run:
```sql
DESCRIBE offer_popups;
```

Expected columns:
```
id, title, description, image_url, coupon_code, discount_percentage,
button_text, button_link, is_active, show_on_homepage, start_date, end_date,
trigger_type, show_on_pages, show_delay, max_shows_per_session,
created_at, updated_at
```

### 5. Test Existing Popup

If you have existing popups, they will work with defaults:
- `trigger_type`: 'page_load'
- `show_on_pages`: null
- `show_delay`: 2000ms
- `max_shows_per_session`: 1

---

## 🧪 Testing Checklist

### Admin Panel Testing

- [ ] **Navigate to** `/admin/offer-popups`
- [ ] **Console shows**: "Fetching offer popups from API..."
- [ ] **Console shows**: "Popups saved to localStorage: X"
- [ ] **Table displays** existing popups with images
- [ ] **Click** "Create New Popup"
- [ ] **Upload** an image
- [ ] **Enter** coupon code (e.g., "WELCOME20")
- [ ] **Select** trigger type (Page Load or Click Specific Pages)
- [ ] **Toggle** "Show on Initial Page"
- [ ] **Click** "Create Popup"
- [ ] **Verify**: Success toast appears
- [ ] **Verify**: New popup appears in table
- [ ] **Verify**: Image displays in table

### Frontend Testing (Home Page)

- [ ] **Visit**: `https://skbakers.com/`
- [ ] **Wait**: 2 seconds (default delay)
- [ ] **Verify**: Popup appears with offer image
- [ ] **Verify**: Close button works (X button)
- [ ] **Verify**: ESC key closes popup
- [ ] **Verify**: Clicking backdrop closes popup
- [ ] **Refresh** page
- [ ] **Verify**: Popup does NOT show again (session tracking works)

### Frontend Testing (Product Pages)

- [ ] **Visit**: `https://skbakers.com/products`
- [ ] **Wait**: 2 seconds
- [ ] **Verify**: Popup appears (if not shown in session already)
- [ ] **Close** popup
- [ ] **Click** on any product
- [ ] **Visit**: Product detail page
- [ ] **Verify**: Popup does NOT show again (session tracking)
- [ ] **Close browser** completely
- [ ] **Reopen** and visit product page
- [ ] **Verify**: Popup shows again (new session)

### Console Testing

Open browser console (F12) and check for these logs:

**Expected on Admin Panel**:
```
📊 Fetching offer popups from API...
💾 Popups saved to localStorage: 1
```

**Expected on Frontend**:
```
🔍 Popup loading...
🔍 Raw localStorage data: [...]
🔍 Parsed popups: Array(1)
🔍 Checking popup: {id: X, isActive: true, ...}
✅ Showing popup on page load with delay: 2000
🎉 Popup is now visible!
```

**Should NOT see**:
```
❌ isActive: false
❌ Found active popup: undefined
❌ No user token found
```

---

## 🐛 Troubleshooting

### Issue 1: Popup Not Showing

**Symptom**: Console shows "Found active popup: undefined"

**Check**:
1. Is popup Active in admin panel? (Green "Active" badge)
2. Run in console: `JSON.parse(localStorage.getItem('offerPopups'))`
3. Check if `isActive: true` (not `false` or `1`)
4. Check if `endDate` is in the future or `null`

**Fix**:
```javascript
// Clear and refresh
localStorage.removeItem('offerPopups');
// Go to admin panel to fetch fresh data
```

### Issue 2: Database Errors

**Symptom**: "Unknown column 'trigger_type'" in console

**Cause**: Database migration not run

**Fix**: Run the SQL migration in phpMyAdmin (Step 1 above)

### Issue 3: Image Not Displaying

**Symptom**: "No Image" in admin table

**Check**:
1. Image path in database: `/backend/uploads/offer-popups/offer_XXX.webp`
2. File exists on server
3. File permissions: 644 or 755

**Fix**:
```bash
# Check file exists
ls -la /public_html/backend/uploads/offer-popups/

# Fix permissions if needed
chmod 755 /public_html/backend/uploads/offer-popups/
chmod 644 /public_html/backend/uploads/offer-popups/*.webp
```

### Issue 4: "Bearer undefined" in Headers

**Symptom**: API returns 401 Unauthorized

**Cause**: Token not in localStorage

**Fix**:
1. Logout and login again to admin panel
2. Token will be stored in localStorage
3. Try creating popup again

### Issue 5: Old JavaScript Loading

**Symptom**: Still seeing old file name in Network tab (e.g., `index-BkqxBcMI.js`)

**Fix**:
1. Hard refresh: `Ctrl + F5`
2. Clear cache: `Ctrl + Shift + Delete`
3. Verify `index.html` has correct script tag
4. Check file uploaded to correct location

### Issue 6: JSON Parse Error for show_on_pages

**Symptom**: Console error "Unexpected token" when parsing show_on_pages

**Check**:
1. Database column type is `JSON`
2. Data stored as valid JSON: `["home", "contact"]`

**Fix**: If column is VARCHAR, change to JSON:
```sql
ALTER TABLE offer_popups MODIFY COLUMN show_on_pages JSON;
```

---

## 📊 Data Flow Diagram

```
Admin Creates Popup
    ↓
Frontend: AdminOfferPopups.jsx
  - Collect form data (coupon, image, trigger type, pages)
  - Convert to API format (camelCase → API)
  - Send via offerPopupAPI.createOfferPopup()
    ↓
Backend: offer-popups.php
  - Receive JSON payload
  - Extract fields (title, description, imageUrl, etc.)
  - Handle Base64 image → save as file
  - Parse JSON fields (show_on_pages)
  - INSERT into database with new fields
    ↓
Database: offer_popups table
  - Store all fields including:
    - trigger_type (VARCHAR)
    - show_on_pages (JSON)
    - show_delay (INT)
    - max_shows_per_session (INT)
    ↓
Frontend: AdminOfferPopups.jsx (Fetch)
  - Call offerPopupAPI.getAllOfferPopups()
  - Receive data from backend
  - Normalize fields (snake_case → camelCase)
  - Convert types (1/0 → true/false)
  - Parse JSON (show_on_pages string → array)
  - Store in localStorage['offerPopups']
  - Dispatch 'offerPopupsUpdated' event
    ↓
Frontend: WelcomeOfferPopup.jsx (Display)
  - Read from localStorage['offerPopups']
  - Filter active popups (isActive === true)
  - Check expiration (endDate > now)
  - Check session (not already shown)
  - Check trigger type (page_load / click_pages)
  - Show popup with delay (show_delay ms)
  - Track in sessionStorage (max_shows_per_session)
    ↓
User Sees Popup on:
  - Home page ✅
  - Product listing page ✅
  - Product detail pages ✅
```

---

## 🔒 Security Notes

- ✅ Authentication required for all Admin endpoints
- ✅ Base64 validation before decoding
- ✅ File write error handling
- ✅ SQL injection protection (prepared statements)
- ✅ Input sanitization on all fields
- ✅ Upload directory permissions checked

---

## 📈 Performance Notes

- **Bundle size**: 1.34 MB (uncompressed), 291 KB (gzipped)
- **API calls**: Cached in localStorage, reduces server load
- **Session tracking**: Uses sessionStorage, no database writes
- **Image format**: WebP for smaller file size
- **Popup delay**: 2000ms default, customizable per popup

---

## ✅ Success Criteria

After deployment, you should see:

1. ✅ Admin can create popups with all options
2. ✅ Popups show on home, product listing, and product detail pages
3. ✅ Trigger types work (page load vs click pages)
4. ✅ Session tracking prevents popup spam
5. ✅ Images display correctly in admin and frontend
6. ✅ Console shows no errors
7. ✅ Data persists across page refreshes
8. ✅ Boolean values work correctly (isActive: true/false)
9. ✅ All database fields mapped and functional
10. ✅ No "undefined" errors in console

---

## 📝 Summary of Changes

### Database
- Added 4 new columns: `trigger_type`, `show_on_pages`, `show_delay`, `max_shows_per_session`

### Backend (offer-popups.php)
- Added field handling in createOfferPopup() (lines 224-228)
- Updated INSERT statement (lines 305-313)
- Updated updateOfferPopup() (lines 491-507)
- Updated getActiveOfferPopups() SELECT (lines 122-124)

### Frontend (AdminOfferPopups.jsx)
- Updated form payload to send all fields (lines 143-159)
- Enhanced normalization with type conversion (lines 88-105)
- Added JSON parsing for show_on_pages (line 95)
- Added Boolean conversion for isActive (line 94)

### Frontend (ProductDetails.jsx & ProductListing.jsx)
- Added WelcomeOfferPopup component render

### Build
- New bundle: index-eQZ4qslo.js (1.34 MB)
- Updated index.html with new script reference

---

## 🚀 Deployment Commands

### Via Hostinger File Manager
1. Navigate to `/public_html/backend/api/`
2. Upload `offer-popups.php` (replace existing)
3. Navigate to `/public_html/assets/`
4. Upload `index-eQZ4qslo.js`
5. Navigate to `/public_html/`
6. Upload `index.html` (replace existing)
7. Go to phpMyAdmin, run SQL migration

### Via SSH (if available)
```bash
# Upload backend
scp hostinger_upload/backend/api/offer-popups.php user@server:/public_html/backend/api/

# Upload frontend
scp hostinger_upload/frontend/assets/index-eQZ4qslo.js user@server:/public_html/assets/
scp hostinger_upload/frontend/index.html user@server:/public_html/

# Run migration via MySQL CLI
mysql -u username -p database_name < php-backend/database/add-popup-advanced-fields.sql
```

---

## 🎉 Completion

After following all steps:

✅ Offer popup system fully functional end-to-end
✅ All missing fields added and mapped
✅ No data loss on form submission
✅ Popups display on all configured pages
✅ Session management prevents spam
✅ Boolean type mismatch resolved
✅ Image display working correctly
✅ Production-ready deployment

**Estimated total deployment time**: 15-20 minutes

**Need help?** Check console logs for detailed error messages.
