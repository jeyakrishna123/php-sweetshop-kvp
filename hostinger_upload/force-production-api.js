// FORCE PRODUCTION API - ULTIMATE FIX
(function() {
    'use strict';
    
    // Production API configuration (Silent execution - no console logs)
    
    // 1. FORCE ALL ENVIRONMENT VARIABLES
    window.NODE_ENV = 'production';
    window.VITE_API_URL = 'https://skbakers.com/api';
    window.VITE_ENV = 'production';
    window.ENV = 'production';
    
    // Override process.env if available
    if (typeof process !== 'undefined') {
        process.env.NODE_ENV = 'production';
        process.env.VITE_API_URL = 'https://skbakers.com/api';
        process.env.VITE_ENV = 'production';
    }
    
    // 2. AGGRESSIVE FETCH OVERRIDE
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        let newUrl = url;
        
        if (typeof url === 'string') {
            // Catch all localhost patterns
            if (url.includes('localhost') && url.includes('/api/')) {
                newUrl = url.replace(/http:\/\/localhost:\d+\/api\//, 'https://skbakers.com/api/');
            } else if (url.startsWith('/api/')) {
                newUrl = 'https://skbakers.com' + url;
            } else if (url.includes('localhost:8000')) {
                newUrl = url.replace('localhost:8000', 'skbakers.com');
            } else if (url.includes('localhost:3000')) {
                newUrl = url.replace('localhost:3000', 'skbakers.com');
            }
        }
        
        // Silently redirect to production API
        return originalFetch.call(this, newUrl, options);
    };
    
    // 3. OVERRIDE AXIOS
    if (typeof window.axios !== 'undefined') {
        window.axios.defaults.baseURL = 'https://skbakers.com/api';
        // Axios redirected to production silently
    }
    
    // 4. OVERRIDE XMLHttpRequest
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        xhr.open = function(method, url, ...args) {
            let newUrl = url;
            if (typeof url === 'string' && url.includes('localhost')) {
                newUrl = url.replace(/http:\/\/localhost:\d+/, 'https://skbakers.com');
            }
            // Silently redirect XHR to production
            return originalOpen.call(this, method, newUrl, ...args);
        };
        return xhr;
    };
    
    // 5. OVERRIDE ANY API CONFIG FUNCTIONS
    window.getApiConfig = function() {
        return {
            BASE_URL: 'https://skbakers.com/api',
            TIMEOUT: 10000
        };
    };
    
    window.getBannerApiUrl = function() {
        return 'https://skbakers.com/api/banners/active';
    };
    
    // 6. CLEAR ANY CACHED API CONFIG
    if (window.localStorage) {
        localStorage.removeItem('api_config');
        localStorage.removeItem('api_base_url');
        localStorage.removeItem('vite_api_url');
    }
    
    // Production API fix applied silently - no console output
    
    // 7. SUCCESS MESSAGE REMOVED (as requested)
    // The green banner message has been removed
    
})();
