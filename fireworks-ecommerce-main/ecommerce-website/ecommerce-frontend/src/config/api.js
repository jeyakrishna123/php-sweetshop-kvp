// Helper function to get base URL with runtime detection (prioritizes runtime over build-time)
const getBaseURL = () => {
  // 1. Check for window flag set by index.html script (runs before React)
  if (typeof window !== 'undefined' && window.__PRODUCTION_API_URL__) {
    return window.__PRODUCTION_API_URL__;
  }
  // 2. Check for explicit VITE_API_URL environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // 3. CRITICAL: Runtime check - if we're on production domain, use production URL
  // This works even if build-time env vars are wrong
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'skbakers.com' || hostname === 'www.skbakers.com') {
      return 'https://skbakers.com';
    }
  }
  // 4. Check if we're in production mode (build-time check)
  if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
    return 'https://skbakers.com';
  }
  // 5. Default to localhost for development
  return 'http://localhost:8000';
};

// API Configuration
export const API_CONFIG = {
  // Backend API base URL (PHP Backend) - uses runtime detection
  BASE_URL: getBaseURL(),

  // API endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      ADMIN_LOGIN: '/api/auth/login', // PHP backend uses same endpoint for admin
      VERIFY: '/api/auth/verify',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me'
    },
    PRODUCTS: '/api/products',
    ORDERS: '/api/orders',
    USERS: '/api/users',
    ADMIN: '/api/admin'
  },

  // Request timeout (in milliseconds)
  TIMEOUT: 10000,

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000
  }
};

// Environment-specific configurations
export const getApiConfig = () => {
  return {
    ...API_CONFIG,
    BASE_URL: getBaseURL(), // Use runtime detection
    TIMEOUT: API_CONFIG.TIMEOUT
  };
};

// Banner API URL
export const getBannerApiUrl = () => {
  const baseUrl = getBaseURL(); // Use runtime detection
  return `${baseUrl}/api/banners/active`;
};
