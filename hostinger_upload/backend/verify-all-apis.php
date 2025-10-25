<?php
/**
 * Verify All APIs - Local File Check
 * This script verifies all API files are correctly configured
 */

echo "🔍 VERIFYING ALL API FILES\n";
echo "==========================\n\n";

// Check all API files exist
$apiFiles = [
    'api/auth.php' => 'Authentication (Login/Signup)',
    'api/products.php' => 'Products Management',
    'api/categories.php' => 'Categories Management', 
    'api/menu.php' => 'Menu Items',
    'api/orders.php' => 'Order Management',
    'api/users.php' => 'User Management',
    'api/reviews.php' => 'Product Reviews',
    'api/wishlist.php' => 'Wishlist',
    'api/banners.php' => 'Homepage Banners',
    'api/admin.php' => 'Admin Dashboard',
    'api/coupons.php' => 'Discount Coupons',
    'api/offer-popups.php' => 'Offer Popups'
];

echo "1. CHECKING API FILES EXISTENCE:\n";
echo "--------------------------------\n";

$allFilesExist = true;
foreach ($apiFiles as $file => $description) {
    if (file_exists($file)) {
        echo "✅ $file - $description\n";
    } else {
        echo "❌ $file - $description (MISSING)\n";
        $allFilesExist = false;
    }
}

echo "\n2. CHECKING ROUTING LOGIC:\n";
echo "--------------------------\n";

// Check if files have correct routing logic
$routingFiles = [
    'api/auth.php',
    'api/products.php', 
    'api/categories.php',
    'api/menu.php',
    'api/orders.php',
    'api/users.php',
    'api/reviews.php',
    'api/wishlist.php',
    'api/banners.php',
    'api/admin.php',
    'api/coupons.php',
    'api/offer-popups.php'
];

$routingCorrect = true;
foreach ($routingFiles as $file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        if (strpos($content, 'php-backend') !== false && strpos($content, 'pathParts[4]') !== false) {
            echo "✅ $file - Routing logic correct\n";
        } else {
            echo "❌ $file - Routing logic needs fixing\n";
            $routingCorrect = false;
        }
    }
}

echo "\n3. CHECKING CORE FILES:\n";
echo "-----------------------\n";

$coreFiles = [
    'index.php' => 'Main Router',
    'config/database.php' => 'Database Connection',
    'config/config.php' => 'App Configuration',
    'middleware/cors.php' => 'CORS Handling',
    'middleware/auth.php' => 'Authentication Middleware',
    'includes/helpers.php' => 'Helper Functions'
];

foreach ($coreFiles as $file => $description) {
    if (file_exists($file)) {
        echo "✅ $file - $description\n";
    } else {
        echo "❌ $file - $description (MISSING)\n";
        $allFilesExist = false;
    }
}

echo "\n4. CHECKING DATABASE SCHEMA:\n";
echo "----------------------------\n";

if (file_exists('database/schema.sql')) {
    echo "✅ database/schema.sql - Database schema exists\n";
} else {
    echo "❌ database/schema.sql - Database schema missing\n";
    $allFilesExist = false;
}

echo "\n5. SUMMARY:\n";
echo "-----------\n";

if ($allFilesExist && $routingCorrect) {
    echo "🎯 ALL APIS ARE READY!\n";
    echo "✅ All API files exist\n";
    echo "✅ All routing logic is correct\n";
    echo "✅ All core files are present\n";
    echo "\n🚀 YOUR BACKEND IS READY FOR DEPLOYMENT!\n";
    echo "\nNext steps:\n";
    echo "1. Upload all files to Hostinger\n";
    echo "2. Import database schema\n";
    echo "3. Test all endpoints\n";
} else {
    echo "⚠️  SOME ISSUES FOUND:\n";
    if (!$allFilesExist) {
        echo "❌ Some files are missing\n";
    }
    if (!$routingCorrect) {
        echo "❌ Some routing logic needs fixing\n";
    }
    echo "\nPlease fix the issues above before deployment.\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "VERIFICATION COMPLETE!\n";
?>
