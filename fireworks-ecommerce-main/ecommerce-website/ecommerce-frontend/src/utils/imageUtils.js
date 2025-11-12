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

  // For relative paths, use the Vite proxy (CORS-friendly)
  // Vite will proxy /uploads requests to the backend
  if (imagePath.startsWith('/uploads/')) {
    return imagePath; // Vite proxy will handle this
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
  
  // Return fallback or default placeholder
  return fallbackUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&q=80&fm=jpg';
};

// Utility function to handle image errors with better fallbacks
export const handleImageError = (e, fallbackUrl = null) => {
  const defaultFallback = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&q=80&fm=jpg';
  e.target.src = fallbackUrl || defaultFallback;
};

// Utility function to get banner image URL
export const getBannerImageUrl = (banner) => {
  if (!banner || !banner.imageUrl) {
    return 'https://via.placeholder.com/1200x400?text=Banner+Image';
  }
  
  return getImageUrl(banner.imageUrl);
};
