-- ============================================
-- BANNER & POPUP IMAGE STORAGE MIGRATION
-- Purpose: Normalize existing image paths to match product storage format
-- Date: November 13, 2025
-- ============================================

-- IMPORTANT: Backup your database before running this script!
-- This script removes /backend/ prefix from banner and popup images
-- and converts full URLs to relative paths

-- ============================================
-- STEP 1: CHECK CURRENT STATE
-- ============================================

-- Check banners that need fixing
SELECT
    'BANNERS - Need Fixing' AS check_type,
    id,
    image_url,
    mobile_image_url,
    desktop_image_url,
    CASE
        WHEN image_url LIKE '%/backend/%' THEN '❌ Has /backend/'
        WHEN image_url LIKE 'http%' THEN '❌ Full URL'
        WHEN image_url LIKE '/uploads/%' THEN '✅ Correct format'
        ELSE '❓ Unknown format'
    END as status
FROM banners
WHERE image_url LIKE '%/backend/%'
   OR mobile_image_url LIKE '%/backend/%'
   OR desktop_image_url LIKE '%/backend/%'
   OR image_url LIKE 'http%'
   OR mobile_image_url LIKE 'http%'
   OR desktop_image_url LIKE 'http%';

-- Check popups that need fixing
SELECT
    'POPUPS - Need Fixing' AS check_type,
    id,
    title,
    image_url,
    CASE
        WHEN image_url LIKE '%/backend/%' THEN '❌ Has /backend/'
        WHEN image_url LIKE 'http%' THEN '❌ Full URL'
        WHEN image_url LIKE '/uploads/%' THEN '✅ Correct format'
        ELSE '❓ Unknown format'
    END as status
FROM offer_popups
WHERE image_url LIKE '%/backend/%'
   OR image_url LIKE 'http%';

-- ============================================
-- STEP 2: BACKUP CURRENT DATA
-- ============================================

-- Create backup tables
CREATE TABLE IF NOT EXISTS banners_backup_20251113 AS SELECT * FROM banners;
CREATE TABLE IF NOT EXISTS offer_popups_backup_20251113 AS SELECT * FROM offer_popups;

SELECT '✅ Backup tables created' AS status;

-- ============================================
-- STEP 3: FIX BANNERS - Remove /backend/ prefix
-- ============================================

-- Fix main image_url
UPDATE banners
SET image_url = REPLACE(image_url, '/backend/uploads/', '/uploads/')
WHERE image_url LIKE '%/backend/uploads/%';

-- Fix mobile_image_url
UPDATE banners
SET mobile_image_url = REPLACE(mobile_image_url, '/backend/uploads/', '/uploads/')
WHERE mobile_image_url LIKE '%/backend/uploads/%';

-- Fix desktop_image_url
UPDATE banners
SET desktop_image_url = REPLACE(desktop_image_url, '/backend/uploads/', '/uploads/')
WHERE desktop_image_url LIKE '%/backend/uploads/%';

-- Fix full URLs in banners (extract relative path)
UPDATE banners
SET image_url = SUBSTRING(image_url, LOCATE('/uploads/', image_url))
WHERE image_url LIKE 'http%'
  AND LOCATE('/uploads/', image_url) > 0;

UPDATE banners
SET mobile_image_url = SUBSTRING(mobile_image_url, LOCATE('/uploads/', mobile_image_url))
WHERE mobile_image_url LIKE 'http%'
  AND LOCATE('/uploads/', mobile_image_url) > 0;

UPDATE banners
SET desktop_image_url = SUBSTRING(desktop_image_url, LOCATE('/uploads/', desktop_image_url))
WHERE desktop_image_url LIKE 'http%'
  AND LOCATE('/uploads/', desktop_image_url) > 0;

SELECT '✅ Banners fixed' AS status;

-- ============================================
-- STEP 4: FIX POPUPS - Remove /backend/ prefix
-- ============================================

-- Fix image_url - remove /backend/ prefix
UPDATE offer_popups
SET image_url = REPLACE(image_url, '/backend/uploads/', '/uploads/')
WHERE image_url LIKE '%/backend/uploads/%';

-- Fix full URLs in popups (extract relative path)
UPDATE offer_popups
SET image_url = SUBSTRING(image_url, LOCATE('/uploads/', image_url))
WHERE image_url LIKE 'http%'
  AND LOCATE('/uploads/', image_url) > 0;

SELECT '✅ Popups fixed' AS status;

-- ============================================
-- STEP 5: VERIFY MIGRATION
-- ============================================

-- Verify banners are fixed
SELECT
    'BANNERS - After Migration' AS check_type,
    COUNT(*) as total_banners,
    SUM(CASE WHEN image_url LIKE '/uploads/%' OR image_url IS NULL THEN 1 ELSE 0 END) as correct_format,
    SUM(CASE WHEN image_url LIKE '%/backend/%' THEN 1 ELSE 0 END) as still_has_backend,
    SUM(CASE WHEN image_url LIKE 'http%' THEN 1 ELSE 0 END) as still_has_full_url
FROM banners;

-- Verify popups are fixed
SELECT
    'POPUPS - After Migration' AS check_type,
    COUNT(*) as total_popups,
    SUM(CASE WHEN image_url LIKE '/uploads/%' OR image_url IS NULL THEN 1 ELSE 0 END) as correct_format,
    SUM(CASE WHEN image_url LIKE '%/backend/%' THEN 1 ELSE 0 END) as still_has_backend,
    SUM(CASE WHEN image_url LIKE 'http%' THEN 1 ELSE 0 END) as still_has_full_url
FROM offer_popups;

-- Show sample of fixed records
SELECT
    'SAMPLE - Fixed Banners' AS check_type,
    id,
    title,
    image_url,
    mobile_image_url,
    desktop_image_url
FROM banners
ORDER BY updated_at DESC
LIMIT 5;

SELECT
    'SAMPLE - Fixed Popups' AS check_type,
    id,
    title,
    image_url
FROM offer_popups
ORDER BY updated_at DESC
LIMIT 5;

-- ============================================
-- STEP 6: CLEANUP (Optional)
-- ============================================

-- After verifying migration is successful, you can drop backup tables:
-- DROP TABLE IF EXISTS banners_backup_20251113;
-- DROP TABLE IF EXISTS offer_popups_backup_20251113;
-- SELECT '✅ Backup tables dropped' AS status;

-- ============================================
-- ROLLBACK (If needed)
-- ============================================

-- If something went wrong, restore from backup:
-- DELETE FROM banners;
-- INSERT INTO banners SELECT * FROM banners_backup_20251113;
-- DELETE FROM offer_popups;
-- INSERT INTO offer_popups SELECT * FROM offer_popups_backup_20251113;
-- SELECT '✅ Restored from backup' AS status;

-- ============================================
-- EXPECTED RESULTS
-- ============================================

-- After migration, all image paths should be:
-- ✅ /uploads/banners/xxx.jpg
-- ✅ /uploads/popups/xxx.webp
-- ❌ NOT /backend/uploads/xxx.jpg
-- ❌ NOT https://skbakers.com/backend/uploads/xxx.jpg

-- The getImageUrl() function will add /backend/ prefix when retrieving images
-- Result in API response: https://skbakers.com/backend/uploads/banners/xxx.jpg

SELECT '✅ Migration complete! All images should now use relative paths.' AS final_status;
