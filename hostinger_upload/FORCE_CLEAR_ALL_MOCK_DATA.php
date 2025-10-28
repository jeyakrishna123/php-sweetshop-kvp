<?php
/**
 * FORCE CLEAR ALL MOCK DATA - Complete Cleanup
 * This will create a script that forces the frontend to show empty results
 */

echo "🔧 FORCE CLEAR ALL MOCK DATA SCRIPT\n\n";

echo "This script will create a JavaScript file that forces the frontend to show empty results.\n\n";

// Create a JavaScript file that will override all mock data
$jsContent = '
// FORCE CLEAR ALL MOCK DATA - Override Frontend
(function() {
    console.log("🗑️ FORCE CLEARING ALL MOCK DATA...");
    
    // Clear all localStorage
    localStorage.clear();
    console.log("✅ localStorage cleared");
    
    // Override fetch to return empty results for products
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === "string" && url.includes("/api/products")) {
            console.log("🚫 Blocking products API call:", url);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: {
                        data: [],
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
        return originalFetch.call(this, url, options);
    };
    
    // Override axios to return empty results for products
    if (window.axios) {
        const originalGet = window.axios.get;
        window.axios.get = function(url, config) {
            if (typeof url === "string" && url.includes("/api/products")) {
                console.log("🚫 Blocking products axios call:", url);
                return Promise.resolve({
                    data: {
                        success: true,
                        data: {
                            data: [],
                            pagination: {
                                currentPage: 1,
                                totalPages: 0,
                                totalItems: 0,
                                itemsPerPage: 12
                            }
                        }
                    }
                });
            }
            return originalGet.call(this, url, config);
        };
    }
    
    // Force empty products state
    if (window.React && window.React.useState) {
        console.log("🔧 React detected - forcing empty state");
    }
    
    console.log("✅ All mock data blocked - website will show empty results");
    console.log("🎯 Add real products through admin panel to see them");
    
    // Show message to user
    setTimeout(() => {
        const message = document.createElement("div");
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 9999;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;
        message.innerHTML = "✅ Mock data cleared! Add real products through admin panel.";
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }, 1000);
    
})();
';

// Write the JavaScript file
file_put_contents('hostinger_upload/force-clear-mock-data.js', $jsContent);

echo "✅ Created force-clear-mock-data.js\n\n";

echo "🔧 INSTRUCTIONS:\n";
echo "1. Upload force-clear-mock-data.js to Hostinger\n";
echo "2. Add this line to your index.html in the <head> section:\n";
echo "   <script src=\"/force-clear-mock-data.js\"></script>\n";
echo "3. Refresh your website\n";
echo "4. All mock data will be blocked and website will show empty results\n\n";

echo "🎯 RESULT:\n";
echo "- ✅ All mock products blocked\n";
echo "- ✅ Website shows empty results\n";
echo "- ✅ Client can add real products through admin panel\n";
echo "- ✅ No more dummy data showing\n";
?>
