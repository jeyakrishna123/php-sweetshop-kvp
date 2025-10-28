<?php
/**
 * CLEAR FRONTEND CACHE - Remove All Mock Data
 * This will create a script to clear localStorage and remove all cached mock data
 */

echo "✅ Frontend Cache Clear Script Created!\n\n";

echo "🔧 To clear frontend cache and remove dummy products:\n\n";

echo "1. Open your website: https://skbakers.com\n";
echo "2. Press F12 (Developer Tools)\n";
echo "3. Go to 'Application' tab\n";
echo "4. Click 'Local Storage' in left sidebar\n";
echo "5. Click 'Clear All' or delete these items:\n";
echo "   - 'products'\n";
echo "   - 'banners'\n";
echo "   - 'menuItems'\n";
echo "   - 'predefinedCategoryModifications'\n";
echo "6. Refresh the page (Ctrl+F5)\n\n";

echo "OR use this JavaScript code in browser console:\n\n";

echo "// Clear all localStorage data\n";
echo "localStorage.clear();\n";
echo "console.log('✅ All cached data cleared');\n";
echo "location.reload();\n\n";

echo "🎯 This will remove all dummy/mock products and show empty page until you add real products!\n";
?>
