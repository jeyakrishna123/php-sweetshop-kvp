// Production Configuration for SK Bakers
// This file contains production-specific settings

export const PRODUCTION_CONFIG = {
  // API Configuration
  API_BASE_URL: 'https://skbakers.com',
  
  // App Configuration
  APP_NAME: 'SK Bakers',
  APP_VERSION: '2.0.0',
  APP_ENV: 'production',
  
  // Domain Configuration
  DOMAIN: 'skbakers.com',
  FRONTEND_URL: 'https://skbakers.com',
  BACKEND_URL: 'https://skbakers.com',
  
  // Email Configuration
  CONTACT_EMAIL: 'info@upgradenow.in',
  SUPPORT_EMAIL: 'info@upgradenow.in',
  
  // Feature Flags
  ENABLE_ANALYTICS: true,
  ENABLE_DEBUG: false,
  
  // Security
  FORCE_HTTPS: true,
  SECURE_COOKIES: true,
  
  // Performance
  ENABLE_CACHING: true,
  ENABLE_COMPRESSION: true
};

// Override API_CONFIG for production
export const getProductionApiConfig = () => ({
  BASE_URL: PRODUCTION_CONFIG.API_BASE_URL || 'https://skbakers.com',
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      ADMIN_LOGIN: '/api/auth/login',
      VERIFY: '/api/auth/verify',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me'
    },
    PRODUCTS: '/api/products',
    ORDERS: '/api/orders',
    USERS: '/api/users',
    ADMIN: '/api/admin'
  },
  TIMEOUT: 10000,
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000
  }
});
