// Helper function to detect base64 images (improved to catch all cases)
const isBase64Image = (str) => {
  if (!str || typeof str !== 'string') return false;
  
  // Check for data URI format anywhere in string (not just at start)
  if (str.includes('data:image/') || str.includes(';base64,')) return true;
  
  // Check for base64 pattern even if it has path prefixes
  // Look for the base64 data after path prefixes like /uploads/products/
  if (str.includes('/uploads/') && str.includes('data:image/')) return true;
  if (str.includes('/backend/uploads/') && str.includes('data:image/')) return true;
  
  // Check for raw base64 string (long string matching base64 pattern)
  // Base64 images are typically >100 characters and match the pattern
  if (str.length > 100 && /^[A-Za-z0-9+\/]+=*$/.test(str)) {
    // Only treat as base64 if it doesn't look like a file path or URL
    if (!str.includes('/') && !str.includes('\\') && !str.includes('http')) {
      return true;
    }
  }
  
  // Check for base64 pattern in strings with path prefixes
  // e.g., /uploads/products/data:image/webp;base64,...
  if (str.length > 200 && /data:image\/[^;]+;base64,/.test(str)) {
    return true;
  }
  
  return false;
};

// Utility function to construct proper image URLs with CORS fallback
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';

  // CRITICAL: Never convert base64 images to URLs - return null to prevent 414 errors
  if (isBase64Image(imagePath)) {
    console.error('❌ getImageUrl: Base64 image detected, returning null to prevent 414 error');
    return null; // Return null instead of base64 to prevent 414 errors
  }

  // Additional safety: if string contains base64 patterns, don't construct URL
  if (typeof imagePath === 'string' && (imagePath.includes('base64') || (imagePath.length > 500 && !imagePath.includes('.')))) {
    console.error('❌ getImageUrl: Suspicious image string detected, returning null:', imagePath.substring(0, 100));
    return null;
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // For relative paths, construct proper URL
  // In development: Vite proxy will handle /uploads
  // In production: Need to add /backend prefix
  if (imagePath.startsWith('/uploads/')) {
    if (import.meta.env.PROD) {
      // Production: Add /backend prefix
      return `https://skbakers.com/backend${imagePath}`;
    } else {
      // Development: Use Vite proxy
      return imagePath;
    }
  }

  // For paths that already have /backend
  if (imagePath.startsWith('/backend/uploads/')) {
    const backendUrl = import.meta.env.PROD ? 'https://skbakers.com' : 'http://localhost:8000';
    return `${backendUrl}${imagePath}`;
  }

  // For other paths, construct the full URL
  // Use import.meta.env for Vite builds
  const backendUrl = import.meta.env.PROD ? 'https://skbakers.com' : 'http://localhost:8000';
  return `${backendUrl}${imagePath}`;
};

// Utility function to get responsive image URL with fallback
export const getResponsiveImageUrl = (imagePath, fallbackUrl = null) => {
  const url = getImageUrl(imagePath);
  if (url) return url;

  // Return fallback or default placeholder (using data URI to avoid external dependencies)
  return fallbackUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23666" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E';
};

// Utility function to handle image errors with better fallbacks
export const handleImageError = (e, fallbackUrl = null) => {
  // Use data URI as ultimate fallback to prevent 404 errors
  const dataUriFallback = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23666" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E';
  
  // Track if we've already tried the placeholder
  const currentSrc = e.target.src || '';
  const triedPlaceholder = currentSrc.includes('default-product.png');
  
  // If this is already the second error (placeholder also failed), use data URI immediately
  if (triedPlaceholder) {
    e.target.src = dataUriFallback;
    e.target.onerror = null; // Prevent infinite loop
    return;
  }
  
  // If we have a custom fallback that's not external, use it
  if (fallbackUrl && !fallbackUrl.includes('via.placeholder.com') && !fallbackUrl.includes('unsplash.com') && !fallbackUrl.includes('http')) {
    e.target.src = fallbackUrl;
    // Set up fallback for if custom fallback also fails
    e.target.onerror = () => {
      e.target.src = dataUriFallback;
      e.target.onerror = null;
    };
    return;
  }
  
  // Try local placeholder first (but skip if we know it doesn't exist)
  // Since placeholder might not exist, go directly to data URI to avoid 404
  // This prevents the 404 error for default-product.png
  e.target.src = dataUriFallback;
  e.target.onerror = null; // Prevent infinite loop
};

// Utility function to get banner image URL
export const getBannerImageUrl = (banner) => {
  if (!banner || !banner.imageUrl) {
    // Use SVG data URI instead of external placeholder
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400"%3E%3Crect width="1200" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23666" font-size="24"%3EBanner Image%3C/text%3E%3C/svg%3E';
  }

  return getImageUrl(banner.imageUrl);
};
