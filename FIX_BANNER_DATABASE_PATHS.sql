-- Fix Banner Image Paths in Database
-- Problem: Banners stored with /backend/uploads/banners/ but should be /uploads/banners/

-- Step 1: Check current banner paths
SELECT
    id,
    title,
    image_url,
    mobile_image_url,
    desktop_image_url
FROM banners;

-- Step 2: Fix paths - Remove /backend/ prefix from all banner image paths
-- This makes them consistent with how products store paths

UPDATE banners
SET
    image_url = REPLACE(image_url, '/backend/uploads/', '/uploads/'),
    mobile_image_url = REPLACE(mobile_image_url, '/backend/uploads/', '/uploads/'),
    desktop_image_url = REPLACE(desktop_image_url, '/backend/uploads/', '/uploads/')
WHERE
    image_url LIKE '/backend/uploads/%'
    OR mobile_image_url LIKE '/backend/uploads/%'
    OR desktop_image_url LIKE '/backend/uploads/%';

-- Step 3: Verify the fix
SELECT
    id,
    title,
    image_url as 'Image URL (should be /uploads/banners/...)',
    mobile_image_url,
    desktop_image_url
FROM banners;

-- Expected result:
-- image_url should be: /uploads/banners/6914ef43b432f_1762979651.webp
-- NOT: /backend/uploads/banners/6914ef43b432f_1762979651.webp
