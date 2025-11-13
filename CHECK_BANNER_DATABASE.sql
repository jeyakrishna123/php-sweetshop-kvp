-- Check what's in the banners database
SELECT
    id,
    title,
    image_url,
    mobile_image_url,
    desktop_image_url,
    is_active,
    created_at
FROM banners
WHERE is_active = 1
ORDER BY created_at DESC;
