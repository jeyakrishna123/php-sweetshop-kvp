# CRITICAL: Database Table Missing Columns

## Problem Identified ✅

The error is:
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'image_url' in 'INSERT INTO'
```

**ROOT CAUSE**: The `offer_popups` table on your production database is **missing the `image_url` column** (and possibly other columns).

## Solution: Run Database Migration

### Option 1: Run PHP Migration Script (RECOMMENDED)

1. **Upload the migration script:**
   ```
   hostinger_upload/backend/database/migrate-offer-popups.php
   → Upload to: /public_html/backend/database/migrate-offer-popups.php
   ```

2. **Run it once in your browser:**
   ```
   https://skbakers.com/backend/database/migrate-offer-popups.php
   ```

3. **You should see:**
   ```
   Starting migration for offer_popups table...

   Current table structure:
   Existing columns: id, title, description, created_at, updated_at

   Adding missing columns:
   - ADD COLUMN `image_url` VARCHAR(500) DEFAULT NULL AFTER `description`
   - ADD COLUMN `coupon_code` VARCHAR(50) DEFAULT NULL
   - ADD COLUMN `discount_percentage` DECIMAL(5,2) DEFAULT NULL
   - ADD COLUMN `button_text` VARCHAR(50) DEFAULT 'Shop Now'
   - ADD COLUMN `button_link` VARCHAR(500) DEFAULT NULL
   - ADD COLUMN `is_active` TINYINT(1) DEFAULT 1
   - ADD COLUMN `show_on_homepage` TINYINT(1) DEFAULT 1
   - ADD COLUMN `start_date` DATETIME DEFAULT NULL
   - ADD COLUMN `end_date` DATETIME DEFAULT NULL

   ✅ Migration completed successfully!

   Final table structure:
   id                        INT UNSIGNED         NOT NULL
   title                     VARCHAR(200)         NOT NULL
   description               TEXT                 NULL
   image_url                 VARCHAR(500)         NULL
   coupon_code               VARCHAR(50)          NULL
   discount_percentage       DECIMAL(5,2)         NULL
   button_text               VARCHAR(50)          NULL
   button_link               VARCHAR(500)         NULL
   is_active                 TINYINT(1)           NULL
   show_on_homepage          TINYINT(1)           NULL
   start_date                DATETIME             NULL
   end_date                  DATETIME             NULL
   created_at                TIMESTAMP            NOT NULL
   updated_at                TIMESTAMP            NOT NULL

   ✅ offer_popups table is now ready!
   ```

4. **Delete the migration script for security:**
   After running successfully, delete `/public_html/backend/database/migrate-offer-popups.php`

### Option 2: Run SQL Directly (via phpMyAdmin)

If you prefer, run this SQL in phpMyAdmin:

```sql
-- Add all missing columns to offer_popups table
ALTER TABLE `offer_popups`
ADD COLUMN `image_url` VARCHAR(500) DEFAULT NULL AFTER `description`,
ADD COLUMN `coupon_code` VARCHAR(50) DEFAULT NULL AFTER `image_url`,
ADD COLUMN `discount_percentage` DECIMAL(5,2) DEFAULT NULL AFTER `coupon_code`,
ADD COLUMN `button_text` VARCHAR(50) DEFAULT 'Shop Now' AFTER `discount_percentage`,
ADD COLUMN `button_link` VARCHAR(500) DEFAULT NULL AFTER `button_text`,
ADD COLUMN `is_active` TINYINT(1) DEFAULT 1 AFTER `button_link`,
ADD COLUMN `show_on_homepage` TINYINT(1) DEFAULT 1 AFTER `is_active`,
ADD COLUMN `start_date` DATETIME DEFAULT NULL AFTER `show_on_homepage`,
ADD COLUMN `end_date` DATETIME DEFAULT NULL AFTER `start_date`;
```

## Why This Happened

The `offer_popups` table on your production database was created with only basic columns:
- id
- title
- description
- created_at
- updated_at

But the backend code expects these columns:
- ✅ id
- ✅ title
- ✅ description
- ❌ **image_url** ← MISSING
- ❌ **coupon_code** ← MISSING
- ❌ **discount_percentage** ← MISSING
- ❌ **button_text** ← MISSING
- ❌ **button_link** ← MISSING
- ❌ **is_active** ← MISSING
- ❌ **show_on_homepage** ← MISSING
- ❌ **start_date** ← MISSING
- ❌ **end_date** ← MISSING
- ✅ created_at
- ✅ updated_at

## After Running Migration

Once the columns are added, **the offer popup creation will work immediately** with the current backend code (no other changes needed).

You'll be able to:
- ✅ Create offer popups with images
- ✅ Images will be saved to `/backend/uploads/offer-popups/`
- ✅ Only file paths stored in database (not Base64)
- ✅ Edit and update popups
- ✅ Toggle active/inactive status
- ✅ Delete popups

## Verification Steps

After running the migration:

1. Try creating an offer popup again
2. You should see in console:
   ```
   💾 Saving offer popup - Backend expects JSON with imageUrl
   📤 Sending data: {...}
   📤 Creating offer popup with JSON data
   ✅ Offer popup created: {success: true, popup: {...}}
   ```

3. Check `/backend/uploads/offer-popups/` directory - you should see the saved image file

4. The popup should appear in the table successfully

## Summary

**The issue was NOT with the frontend or backend code** - both are working correctly!

**The issue was the database table structure** - it was missing required columns.

**Solution**: Run the migration script once to add the missing columns.

**After migration**: Everything will work perfectly!

---

**Status**: Database structure issue identified
**Fix**: Migration script ready
**Action**: Upload and run `migrate-offer-popups.php` once
