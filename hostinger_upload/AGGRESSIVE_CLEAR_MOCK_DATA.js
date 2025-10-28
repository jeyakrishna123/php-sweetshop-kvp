// AGGRESSIVE CLEAR ALL MOCK DATA - Complete Block
(function() {
    console.log("🗑️ AGGRESSIVE CLEARING ALL MOCK DATA...");
    
    // Clear all localStorage immediately
    localStorage.clear();
    sessionStorage.clear();
    console.log("✅ All storage cleared");
    
    // Override ALL fetch calls
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === "string") {
            // Block all product-related API calls
            if (url.includes("/api/products") || 
                url.includes("/api/bestsellers") || 
                url.includes("/api/categories") ||
                url.includes("/api/menu")) {
                console.log("🚫 BLOCKING API call:", url);
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({
                        success: true,
                        data: {
                            data: [],
                            products: [],
                            categories: [],
                            pagination: {
                                currentPage: 1,
                                totalPages: 0,
                                totalItems: 0,
                                itemsPerPage: 12
                            }
                        }
                    })
                });
            }
        }
        return originalFetch.call(this, url, options);
    };
    
    // Override ALL axios calls
    if (window.axios) {
        const originalGet = window.axios.get;
        const originalPost = window.axios.post;
        
        window.axios.get = function(url, config) {
            if (typeof url === "string" && 
                (url.includes("/api/products") || 
                 url.includes("/api/bestsellers") || 
                 url.includes("/api/categories") ||
                 url.includes("/api/menu"))) {
                console.log("🚫 BLOCKING axios GET:", url);
                return Promise.resolve({
                    data: {
                        success: true,
                        data: {
                            data: [],
                            products: [],
                            categories: []
                        }
                    }
                });
            }
            return originalGet.call(this, url, config);
        };
        
        window.axios.post = function(url, data, config) {
            if (typeof url === "string" && url.includes("/api/products")) {
                console.log("🚫 BLOCKING axios POST:", url);
                return Promise.resolve({
                    data: {
                        success: true,
                        message: "Mock data blocked"
                    }
                });
            }
            return originalPost.call(this, url, data, config);
        };
    }
    
    // Force empty state for React components
    const originalUseState = window.React?.useState;
    if (originalUseState) {
        window.React.useState = function(initialState) {
            if (Array.isArray(initialState) && initialState.length > 0) {
                console.log("🚫 BLOCKING React state with mock data");
                return [(), () => {}]; // Return empty state
            }
            return originalUseState.call(this, initialState);
        };
    }
    
    // Block all product-related DOM updates
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        
        if (tagName === 'div' && element.className && 
            (element.className.includes('product') || 
             element.className.includes('bestseller'))) {
            console.log("🚫 BLOCKING product element creation");
            element.style.display = 'none';
        }
        
        return element;
    };
    
    // Force hide all existing product elements
    setTimeout(() => {
        const productElements = document.querySelectorAll('[class*="product"], [class*="bestseller"], [class*="card"]');
        productElements.forEach(el => {
            if (el.textContent.includes('Cake') || 
                el.textContent.includes('₹') || 
                el.textContent.includes('Test')) {
                console.log("🚫 HIDING mock product element");
                el.style.display = 'none';
                el.remove();
            }
        });
    }, 1000);
    
    // Show aggressive message
    setTimeout(() => {
        const message = document.createElement("div");
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 99999;
            font-family: Arial, sans-serif;
            font-weight: bold;
            box-shadow: 0 8px 16px rgba(0,0,0,0.5);
            border: 2px solid #d32f2f;
        `;
        message.innerHTML = "🚫 ALL MOCK DATA BLOCKED!<br/>Add real products through admin panel.";
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 8000);
    }, 500);
    
    console.log("✅ AGGRESSIVE mock data blocking activated");
    console.log("🎯 All product APIs blocked - website will show empty");
    
})();
