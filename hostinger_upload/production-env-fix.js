// Production Environment Fix for SK Bakers
// This script fixes the development environment issues in production

(function() {
  'use strict';
  
  console.log('🔧 Applying production environment fixes...');
  
  // Override environment variables
  if (typeof window !== 'undefined') {
    // Set production environment
    window.ENV = 'production';
    window.NODE_ENV = 'production';
    window.VITE_API_URL = 'https://skbakers.com/api';
    window.VITE_ENV = 'production';
    
    // Override process.env if it exists
    if (typeof process !== 'undefined') {
      process.env.NODE_ENV = 'production';
      process.env.VITE_API_URL = 'https://skbakers.com/api';
      process.env.VITE_ENV = 'production';
    }
  }
  
  // Fix API base URL for all fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    // Convert relative URLs to absolute production URLs
    if (typeof url === 'string' && url.startsWith('/api/')) {
      url = 'https://skbakers.com' + url;
    } else if (typeof url === 'string' && url.startsWith('http://localhost:8000/api/')) {
      url = url.replace('http://localhost:8000/api/', 'https://skbakers.com/api/');
    }
    
    console.log('🌐 API Request:', url);
    return originalFetch.call(this, url, options);
  };
  
  // Fix axios base URL if axios is available
  if (typeof window.axios !== 'undefined') {
    window.axios.defaults.baseURL = 'https://skbakers.com/api';
    console.log('✅ Axios base URL set to production');
  }
  
  // Log the fixes
  console.log('✅ Production environment fixes applied');
  console.log('API Base URL: https://skbakers.com/api');
  console.log('Environment: production');
  
  // Add a global function to check environment
  window.checkEnvironment = function() {
    console.log('🔍 Environment Check:');
    console.log('- NODE_ENV:', typeof process !== 'undefined' ? process.env.NODE_ENV : 'undefined');
    console.log('- VITE_API_URL:', window.VITE_API_URL);
    console.log('- Window ENV:', window.ENV);
    console.log('- Current URL:', window.location.href);
  };
  
})();