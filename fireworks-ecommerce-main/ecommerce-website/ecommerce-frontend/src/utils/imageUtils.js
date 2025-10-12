// Utility function to construct proper image URLs with CORS fallback
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
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
  const backendUrl = 'http://localhost:8000';
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
