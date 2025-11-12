-- ============================================
-- END-TO-END IMAGE STORAGE CHECK
-- Run this on your production database
-- ============================================

-- 1. CHECK PRODUCTS TABLE - Image Storage Format
SELECT
    'PRODUCTS - Sample Images' AS check_type,
    id,
    name,
    images,
    thumbnail,
    LENGTH(images) as images_length,
    CASE
        WHEN images LIKE '%data:image%' THEN '❌ HAS BASE64'
        WHEN images LIKE '%http%' THEN '⚠️ HAS FULL URLs'
        WHEN images LIKE '%/uploads/%' THEN '✅ RELATIVE PATHS'
        ELSE '❓ UNKNOWN FORMAT'
    END as image_format
FROM products
WHERE images IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

-- 2. CHECK OFFER_POPUPS TABLE
SELECT
    'OFFER_POPUPS - Current Popups' AS check_type,
    id,
    title,
    image_url,
    is_active,
    CASE
        WHEN image_url LIKE '%data:image%' THEN '❌ HAS BASE64'
        WHEN image_url LIKE '%http%' THEN '⚠️ FULL URL'
        WHEN image_url LIKE '/uploads/%' THEN '✅ RELATIVE PATH'
        WHEN image_url LIKE '/backend/uploads/%' THEN '✅ RELATIVE WITH /backend'
        ELSE '❓ UNKNOWN'
    END as url_format
FROM offer_popups
WHERE is_active = 1
LIMIT 10;

-- 3. FIND PRODUCTS WITH MISSING IMAGE FILES
SELECT
    'PRODUCTS - Missing Menu Items Images' AS check_type,
    id,
    name,
    images
FROM products
WHERE images LIKE '%menu-items%'
AND images LIKE '%690f0b2fc68ec_1762593583%'
LIMIT 5;

-- 4. CHECK FOR BASE64 IMAGES IN DATABASE
SELECT
    'PRODUCTS - Base64 Images Count' AS check_type,
    COUNT(*) as count,
    'These products have base64 images stored' as note
FROM products
WHERE images LIKE '%data:image%'
   OR images LIKE '%base64%';

-- 5. CHECK UPLOAD DIRECTORIES REFERENCED
SELECT
    'PRODUCTS - Upload Directories Used' AS check_type,
    CASE
        WHEN images LIKE '%/uploads/products/%' THEN 'products'
        WHEN images LIKE '%/uploads/menu-items/%' THEN 'menu-items'
        WHEN images LIKE '%/uploads/banners/%' THEN 'banners'
        WHEN images LIKE '%/uploads/popups/%' THEN 'popups'
        ELSE 'other'
    END as directory,
    COUNT(*) as count
FROM products
WHERE images IS NOT NULL
GROUP BY directory;

-- 6. FIX MISSING MENU-ITEMS IMAGES
-- Replace missing menu-items images with placeholder or NULL
UPDATE products
SET images = JSON_ARRAY() -- Empty array
WHERE images LIKE '%menu-items%'
AND images LIKE '%690f0b2fc68ec_1762593583%';

-- Show affected products
SELECT
    'PRODUCTS - Fixed Missing Images' AS check_type,
    id,
    name,
    images as new_images
FROM products
WHERE images = JSON_ARRAY()
LIMIT 5;

-- 7. CHECK POPUPS WITH INVALID PATHS
SELECT
    'OFFER_POPUPS - Popups Needing URL Fix' AS check_type,
    id,
    title,
    image_url as current_url,
    CASE
        WHEN image_url NOT LIKE '%/backend/%' AND image_url LIKE '/uploads/%'
        THEN CONCAT('/backend', image_url)
        ELSE image_url
    END as should_be
FROM offer_popups
WHERE image_url IS NOT NULL
AND image_url NOT LIKE '%http%';

-- 8. VERIFY TABLE STRUCTURE
SHOW COLUMNS FROM offer_popups;

-- 9. CHECK FOR ACTIVE POPUPS
SELECT
    'OFFER_POPUPS - Active Count' AS check_type,
    COUNT(*) as active_popups,
    GROUP_CONCAT(id) as popup_ids
FROM offer_popups
WHERE is_active = 1
AND (start_date IS NULL OR start_date <= NOW())
AND (end_date IS NULL OR end_date >= NOW());

-- 10. SAMPLE CORRECT IMAGE FORMAT
SELECT
    'EXAMPLE - Correct Storage Format' AS info,
    'Images should be stored as JSON array of relative paths' as rule,
    '["' || CHR(47) || 'uploads' || CHR(47) || 'products' || CHR(47) || 'xxx.webp"]' as example_format;
