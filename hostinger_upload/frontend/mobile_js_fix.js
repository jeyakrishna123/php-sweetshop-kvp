/**
 * MOBILE JAVASCRIPT FIX FOR SK BAKERS
 * This script fixes mobile API connection issues
 */

(function() {
    'use strict';
    
    console.log('🔧 Mobile JavaScript Fix Loading...');
    
    // Fix 1: Override fetch for mobile compatibility
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        // Add mobile-specific headers
        const mobileOptions = {
            ...options,
            headers: {
                'User-Agent': navigator.userAgent,
                'X-Mobile-Request': 'true',
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        // Add timeout for mobile networks
        if (!mobileOptions.timeout) {
            mobileOptions.timeout = 15000;
        }
        
        console.log('📱 Mobile fetch request:', url);
        return originalFetch(url, mobileOptions)
            .then(response => {
                console.log('📱 Mobile fetch response:', response.status, url);
                return response;
            })
            .catch(error => {
                console.error('📱 Mobile fetch error:', error, url);
                throw error;
            });
    };
    
    // Fix 2: Mobile touch events
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        console.log('📱 Touch device detected');
    }
    
    // Fix 3: Mobile viewport fix
    function fixMobileViewport() {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            console.log('📱 Viewport fixed for mobile');
        }
    }
    
    // Fix 4: Mobile CSS fixes
    function addMobileCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile-specific fixes */
            @media (max-width: 768px) {
                body {
                    -webkit-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                    overflow-x: hidden;
                }
                
                .mobile-menu-container {
                    display: block !important;
                }
                
                .desktop-menu {
                    display: none !important;
                }
                
                * {
                    -webkit-tap-highlight-color: transparent;
                }
                
                button, .btn {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                }
                
                /* Fix mobile footer */
                .mobile-footer {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                }
            }
            
            /* Touch device optimizations */
            @media (hover: none) and (pointer: coarse) {
                .hover\\:bg-gray-100:hover {
                    background-color: transparent;
                }
                
                .hover\\:text-red-600:hover {
                    color: inherit;
                }
            }
        `;
        document.head.appendChild(style);
        console.log('📱 Mobile CSS fixes applied');
    }
    
    // Fix 5: Mobile API retry logic
    function addMobileAPIRetry() {
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            return originalFetch(url, options)
                .catch(error => {
                    console.log('📱 API retry attempt for:', url);
                    // Retry once for mobile
                    return originalFetch(url, options);
                });
        };
    }
    
    // Fix 6: Mobile error handling
    window.addEventListener('error', function(event) {
        console.error('📱 Mobile error:', event.error);
        // Don't let errors break the mobile experience
        event.preventDefault();
    });
    
    // Fix 7: Mobile network detection
    function handleNetworkChange() {
        if (navigator.connection) {
            navigator.connection.addEventListener('change', function() {
                console.log('📱 Network changed:', navigator.connection.effectiveType);
                // Reload if connection improves
                if (navigator.connection.effectiveType === '4g') {
                    console.log('📱 Network improved, considering reload');
                }
            });
        }
    }
    
    // Fix 8: Mobile loading states
    function addMobileLoadingStates() {
        // Add loading indicator for mobile
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'mobile-loading';
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
                    <p>Loading...</p>
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
    }
    
    // Initialize all fixes
    function initializeMobileFixes() {
        console.log('🔧 Initializing mobile fixes...');
        
        fixMobileViewport();
        addMobileCSS();
        addMobileAPIRetry();
        handleNetworkChange();
        addMobileLoadingStates();
        
        console.log('✅ Mobile fixes initialized successfully');
    }
    
    // Run fixes when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMobileFixes);
    } else {
        initializeMobileFixes();
    }
    
    // Also run on window load
    window.addEventListener('load', function() {
        console.log('📱 Mobile fixes applied on window load');
    });
    
})();
