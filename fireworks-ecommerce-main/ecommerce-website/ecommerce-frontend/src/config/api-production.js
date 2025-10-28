// Production API Configuration
// This file overrides the development API configuration for production

export const API_CONFIG = {
  // Backend API base URL (PHP Backend) - Production
  BASE_URL: 'https://skbakers.com/api',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      ADMIN_LOGIN: '/auth/login',
      VERIFY: '/auth/verify',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      VERIFY_SIGNUP_OTP: '/auth/verify-signup-otp',
      RESEND_SIGNUP_OTP: '/auth/resend-signup-otp',
      FORGOT_PASSWORD: '/auth/forgot-password',
      VERIFY_OTP: '/auth/verify-otp',
      RESET_PASSWORD: '/auth/reset-password'
    },
    PRODUCTS: '/products',
    ORDERS: '/orders',
    USERS: '/users',
    ADMIN: '/admin',
    BANNERS: '/banners',
    WISHLIST: '/wishlist',
    REVIEWS: '/reviews',
    COUPONS: '/coupons'
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 10000,
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000
  }
};

// Production-specific configurations
export const getApiConfig = () => {
  return {
    ...API_CONFIG,
    BASE_URL: 'https://skbakers.com/api',
    TIMEOUT: 10000
  };
};

// Production-specific banner API
export const getBannerApiUrl = () => {
  return 'https://skbakers.com/api/banners/active';
};

// Production-specific auth API
export const getAuthApiUrl = (endpoint) => {
  return `https://skbakers.com/api/auth/${endpoint}`;
};

// Production-specific OTP API
export const getOtpApiUrl = (endpoint) => {
  return `https://skbakers.com/api/auth/${endpoint}`;
};
