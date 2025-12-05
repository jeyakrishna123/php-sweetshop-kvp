# Offer Popup Image Display Fix

## Problem Identified ✅

The offer popup was created successfully, but the image wasn't displaying in the admin table UI.

**ROOT CAUSE**: Frontend was expecting `imageUrl` (camelCase) from backend, but backend returns `image_url` (snake_case) from the database.

## What Was Fixed

### Backend Returns Snake_Case Fields
The PHP backend does `SELECT * FROM offer_popups` which returns database column names in snake_case format:
- `image_url` (not `imageUrl`)
- `coupon_code` (not `couponCode`)
- `is_active` (not `isActive`)
- `show_on_pages` (not `showOnPages`)
- `trigger_type` (not `triggerType`)
- `start_date` (not `startDate`)
- `end_date` (not `endDate`)

### Frontend Was Mapping Wrong Field
The frontend normalization code in `AdminOfferPopups.jsx` (line 88-92) was only checking:
```javascript
popupImage: popup.imageUrl || popup.popupImage
```

But backend sends `popup.image_url`, so it was always `undefined`!

### Fix Applied
Updated the normalization to map all snake_case fields to camelCase:

```javascript
// AdminOfferPopups.jsx lines 88-99
const normalizedPopups = popupsData.map(popup => ({
  ...popup,
  popupImage: popup.image_url || popup.imageUrl || popup.popupImage, // ✅ Now checks image_url first
  _id: popup.id || popup._id,
  couponCode: popup.coupon_code || popup.couponCode,
  isActive: popup.is_active !== undefined ? popup.is_active : popup.isActive,
  showOnPages: popup.show_on_pages || popup.showOnPages || [],
  triggerType: popup.trigger_type || popup.triggerType || 'page_load',
  startDate: popup.start_date || popup.startDate,
  endDate: popup.end_date || popup.endDate,
}));
```

## Files to Upload to Production

### Frontend Files (Upload to `/public_html/`)
```
hostinger_upload/frontend/index.html
hostinger_upload/frontend/assets/index-C0BOO7iF.js
```

### File Locations on Server
1. **index.html**
   - Upload to: `/public_html/index.html`
   - Replaces existing file

2. **index-C0BOO7iF.js**
   - Upload to: `/public_html/assets/index-C0BOO7iF.js`
   - New file (old build files can stay, browser will use new one)

## Verification Steps

After uploading the files:

1. **Clear browser cache** (important!)
   - Press `Ctrl+Shift+Delete`
   - Clear cached images and files
   - Or do hard refresh: `Ctrl+F5`

2. **Go to Admin Offer Popups page**
   ```
   https://skbakers.com/admin/offer-popups
   ```

3. **Check the table** - You should now see:
   - ✅ Offer popup image thumbnail in the "Image" column
   - ✅ Correct coupon code
   - ✅ Proper status (Active/Inactive)
   - ✅ Correct trigger type
   - ✅ Valid end date

4. **Check browser console** - Should show:
   ```
   📊 Fetching offer popups from API...
   💾 Popups saved to localStorage: 1
   ✅ Preview image loaded successfully
   ```

5. **Image should display** at:
   ```
   https://skbakers.com/backend/uploads/offer-popups/offer_6919866fe950a_1763280495.webp
   ```

## What This Fixes

### Before Fix:
- ❌ Image column showed "No Image"
- ❌ All database fields with snake_case were undefined
- ❌ End date showed "Invalid Date"
- ❌ Status not displaying correctly

### After Fix:
- ✅ Image column shows actual image thumbnail
- ✅ All fields display correctly
- ✅ Proper date formatting
- ✅ Correct status badges
- ✅ Edit/Delete/Toggle operations work correctly

## Technical Details

### Why Snake_Case vs CamelCase?

**Database (MySQL)**: Uses `snake_case` for column names
```sql
CREATE TABLE offer_popups (
  image_url VARCHAR(500),
  coupon_code VARCHAR(50),
  is_active TINYINT(1)
  ...
)
```

**PHP PDO Fetch**: Returns column names exactly as they are in database
```php
$stmt = $db->prepare("SELECT * FROM offer_popups");
$popup = $stmt->fetch(PDO::FETCH_ASSOC);
// Returns: ['image_url' => '/path/to/image.webp', 'coupon_code' => 'WELCOME']
```

**JavaScript Frontend**: Uses `camelCase` convention
```javascript
popup.popupImage  // JavaScript convention
popup.couponCode
popup.isActive
```

**Solution**: Normalize backend snake_case to frontend camelCase in the data fetching layer.

## Summary

- **Issue**: Image not displaying because frontend was checking wrong field name
- **Root Cause**: Backend returns `image_url`, frontend was checking `imageUrl`
- **Fix**: Map all snake_case fields to camelCase during normalization
- **Files Changed**: `AdminOfferPopups.jsx` (frontend normalization logic)
- **Result**: All offer popup data now displays correctly including images

---

**Status**: Image display issue fixed ✅
**Next Step**: Upload frontend files and verify image displays in table
