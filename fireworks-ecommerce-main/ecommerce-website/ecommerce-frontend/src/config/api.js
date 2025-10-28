// API Configuration
export const API_CONFIG = {
  // Backend API base URL (PHP Backend) - FORCE PRODUCTION
  BASE_URL: 'https://skbakers.com/api',
  
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

// Environment-specific configurations - FORCE PRODUCTION
export const getApiConfig = () => {
  return {
    ...API_CONFIG,
    BASE_URL: 'https://skbakers.com/api', // ALWAYS USE PRODUCTION
    TIMEOUT: API_CONFIG.TIMEOUT
  };
};

// Production-specific banner API fix - FORCE PRODUCTION
export const getBannerApiUrl = () => {
  return 'https://skbakers.com/api/banners/active';
};
