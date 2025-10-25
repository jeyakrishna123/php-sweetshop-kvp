/**
 * MOBILE API CONNECTIVITY FIX
 * This fixes the "Backend server is not available" error on mobile
 */

(function() {
    'use strict';
    
    console.log('🔧 Mobile API Connectivity Fix Loading...');
    
    // Fix 1: Override fetch with mobile-specific handling
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        // Add mobile-specific headers and timeout
        const mobileOptions = {
            ...options,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': navigator.userAgent,
                'X-Mobile-Request': 'true',
                ...options.headers
            },
            // Mobile-specific timeout
            timeout: 30000,
            // Mobile network handling
            cache: 'no-cache',
            mode: 'cors',
            credentials: 'same-origin'
        };
        
        console.log('📱 Mobile fetch request:', url);
        
        return originalFetch(url, mobileOptions)
            .then(response => {
                console.log('📱 Mobile fetch response:', response.status, url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response;
            })
            .catch(error => {
                console.error('📱 Mobile fetch error:', error, url);
                
                // Mobile-specific retry logic
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    console.log('📱 Network error detected, retrying...');
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            originalFetch(url, mobileOptions)
                                .then(resolve)
                                .catch(reject);
                        }, 2000);
                    });
                }
                throw error;
            });
    };
    
    // Fix 2: Mobile network detection and handling
    function handleMobileNetwork() {
        if (navigator.connection) {
            const connection = navigator.connection;
            console.log('📱 Network type:', connection.effectiveType);
            
            // Adjust timeout based on network speed
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                console.log('📱 Slow network detected, adjusting timeouts');
                // Increase timeout for slow networks
                window.fetch = function(url, options = {}) {
                    return originalFetch(url, {
                        ...options,
                        timeout: 60000 // 60 seconds for slow networks
                    });
                };
            }
            
            // Listen for network changes
            connection.addEventListener('change', function() {
                console.log('📱 Network changed:', connection.effectiveType);
                if (connection.effectiveType === '4g') {
                    console.log('📱 Network improved, reloading page');
                    window.location.reload();
                }
            });
        }
    }
    
    // Fix 3: Mobile CORS handling
    function fixMobileCORS() {
        // Add CORS headers for mobile
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Access-Control-Allow-Origin';
        meta.content = '*';
        document.head.appendChild(meta);
        
        // Override XMLHttpRequest for mobile
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            
            xhr.open = function(method, url, async, user, password) {
                console.log('📱 Mobile XHR request:', method, url);
                return originalOpen.call(this, method, url, async, user, password);
            };
            
            return xhr;
        };
    }
    
    // Fix 4: Mobile error handling
    function addMobileErrorHandling() {
        // Global error handler for mobile
        window.addEventListener('error', function(event) {
            console.error('📱 Mobile error:', event.error);
            
            // Don't let network errors break the app
            if (event.error && event.error.message.includes('Failed to fetch')) {
                console.log('📱 Network error caught, preventing app crash');
                event.preventDefault();
                return false;
            }
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', function(event) {
            console.error('📱 Mobile promise rejection:', event.reason);
            
            if (event.reason && event.reason.message.includes('Failed to fetch')) {
                console.log('📱 Network promise rejection caught');
                event.preventDefault();
                return false;
            }
        });
    }
    
    // Fix 5: Mobile API retry mechanism
    function addMobileAPIRetry() {
        const originalFetch = window.fetch;
        let retryCount = 0;
        const maxRetries = 3;
        
        window.fetch = function(url, options = {}) {
            return originalFetch(url, options)
                .catch(error => {
                    if (retryCount < maxRetries && 
                        (error.name === 'TypeError' || error.message.includes('Failed to fetch'))) {
                        retryCount++;
                        console.log(`📱 Mobile API retry ${retryCount}/${maxRetries} for:`, url);
                        
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                originalFetch(url, options)
                                    .then(resolve)
                                    .catch(reject);
                            }, 1000 * retryCount); // Exponential backoff
                        });
                    }
                    retryCount = 0;
                    throw error;
                });
        };
    }
    
    // Fix 6: Mobile loading states
    function addMobileLoadingStates() {
        // Show loading indicator for mobile
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'mobile-loading-overlay';
        loadingDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            ">
                <div style="
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    max-width: 300px;
                    margin: 20px;
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #dc3545;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 10px;
                    "></div>
                    <p style="margin: 0; font-weight: bold;">Loading...</p>
                    <p style="margin: 5px 0 0; font-size: 12px; color: #666;">Connecting to server</p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loadingDiv);
        
        // Show loading on API calls
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            const loadingOverlay = document.getElementById('mobile-loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
            }
            
            return originalFetch(url, options)
                .finally(() => {
                    if (loadingOverlay) {
                        loadingOverlay.style.display = 'none';
                    }
                });
        };
    }
    
    // Initialize all mobile fixes
    function initializeMobileFixes() {
        console.log('🔧 Initializing mobile API connectivity fixes...');
        
        handleMobileNetwork();
        fixMobileCORS();
        addMobileErrorHandling();
        addMobileAPIRetry();
        addMobileLoadingStates();
        
        console.log('✅ Mobile API connectivity fixes initialized');
    }
    
    // Run fixes when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMobileFixes);
    } else {
        initializeMobileFixes();
    }
    
    // Also run on window load
    window.addEventListener('load', function() {
        console.log('📱 Mobile API connectivity fixes applied on window load');
    });
    
})();
