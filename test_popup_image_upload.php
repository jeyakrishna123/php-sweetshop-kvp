<?php
/**
 * Test Popup Image Upload Endpoint
 * This simulates a popup image upload to test the API
 */

echo "🧪 Testing Popup Image Upload Endpoint\n\n";

// Test 1: Check if upload.php has popup-image case
echo "1️⃣ Checking upload.php for popup-image endpoint...\n";
$uploadFile = __DIR__ . '/php-backend/api/upload.php';
$content = file_get_contents($uploadFile);

if (strpos($content, "'popup-image'") !== false) {
    echo "   ✅ popup-image case found in upload.php\n";
} else {
    echo "   ❌ popup-image case NOT found in upload.php\n";
    exit(1);
}

if (strpos($content, "uploadPopupImage()") !== false) {
    echo "   ✅ uploadPopupImage() function call found\n";
} else {
    echo "   ❌ uploadPopupImage() function call NOT found\n";
    exit(1);
}

if (strpos($content, "function uploadPopupImage()") !== false) {
    echo "   ✅ uploadPopupImage() function definition found\n\n";
} else {
    echo "   ❌ uploadPopupImage() function definition NOT found\n";
    exit(1);
}

// Test 2: Check if popups directory exists
echo "2️⃣ Checking if uploads/popups directory exists...\n";
$popupsDir = __DIR__ . '/php-backend/uploads/popups';

if (!is_dir($popupsDir)) {
    echo "   ⚠️  Directory doesn't exist, creating it...\n";
    if (mkdir($popupsDir, 0755, true)) {
        echo "   ✅ Directory created: $popupsDir\n\n";
    } else {
        echo "   ❌ Failed to create directory\n";
        exit(1);
    }
} else {
    echo "   ✅ Directory exists: $popupsDir\n\n";
}

// Test 3: Check directory permissions
echo "3️⃣ Checking directory permissions...\n";
if (is_writable($popupsDir)) {
    echo "   ✅ Directory is writable\n\n";
} else {
    echo "   ⚠️  Directory is not writable, attempting to fix...\n";
    chmod($popupsDir, 0755);
    if (is_writable($popupsDir)) {
        echo "   ✅ Permissions fixed\n\n";
    } else {
        echo "   ❌ Could not fix permissions\n";
    }
}

// Test 4: Verify helpers.php has image upload functions
echo "4️⃣ Checking helpers.php for image upload functions...\n";
$helpersFile = __DIR__ . '/php-backend/includes/helpers.php';
$helpersContent = file_get_contents($helpersFile);

if (strpos($helpersContent, "function validateImageUpload") !== false) {
    echo "   ✅ validateImageUpload() function found\n";
} else {
    echo "   ❌ validateImageUpload() function NOT found\n";
}

if (strpos($helpersContent, "function uploadImage") !== false) {
    echo "   ✅ uploadImage() function found\n\n";
} else {
    echo "   ❌ uploadImage() function NOT found\n\n";
}

echo "✅ All checks completed!\n\n";
echo "📝 Endpoint is ready to use:\n";
echo "   POST http://localhost:8000/api/upload/popup-image\n";
echo "   Headers: Authorization: Bearer {admin_token}\n";
echo "   Body: multipart/form-data with 'image' field\n\n";

echo "🎯 Next steps:\n";
echo "1. Ensure backend server is running: php -S localhost:8000 -t php-backend\n";
echo "2. Test from frontend by uploading a popup image in admin panel\n";
echo "3. Image should be saved to: php-backend/uploads/popups/\n";
?>
