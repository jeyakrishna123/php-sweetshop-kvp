// Production Configuration for SK Bakers
// This file should be used to override development settings in production

window.PRODUCTION_CONFIG = {
  API_URL: 'https://skbakers.com/api',
  ENV: 'production',
  NODE_ENV: 'production'
};

// Override Vite environment variables for production
if (typeof import !== 'undefined' && import.meta) {
  import.meta.env.VITE_API_URL = 'https://skbakers.com/api';
  import.meta.env.VITE_ENV = 'production';
  import.meta.env.NODE_ENV = 'production';
}

// Override process.env for production
if (typeof process !== 'undefined') {
  process.env.NODE_ENV = 'production';
  process.env.VITE_API_URL = 'https://skbakers.com/api';
  process.env.VITE_ENV = 'production';
}

console.log('🔧 Production configuration loaded');
console.log('API URL:', window.PRODUCTION_CONFIG.API_URL);
console.log('Environment:', window.PRODUCTION_CONFIG.ENV);
