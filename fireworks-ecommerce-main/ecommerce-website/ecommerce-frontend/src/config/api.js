// API Configuration
export const API_CONFIG = {
  // Backend API base URL (PHP Backend)
  // Force production URL if VITE_API_URL is set, otherwise check PROD mode
  BASE_URL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://skbakers.com' : 'http://localhost:8000'),

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
    BASE_URL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://skbakers.com' : 'http://localhost:8000'),
    TIMEOUT: API_CONFIG.TIMEOUT
  };
};

// Banner API URL
export const getBannerApiUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://skbakers.com' : 'http://localhost:8000');
  return `${baseUrl}/api/banners/active`;
};
