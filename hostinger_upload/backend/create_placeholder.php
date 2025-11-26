<?php
/**
 * Create Default Product Placeholder Image
 * Run this script once to create the placeholder image
 * Then delete this file for security
 */

// Set headers
header('Content-Type: text/html; charset=utf-8');

// Security check - uncomment the line below after testing
// if (!isset($_GET['create']) || $_GET['create'] !== 'yes') die('Access denied');

// Create image
$width = 400;
$height = 400;
$image = imagecreatetruecolor($width, $height);

// Colors
$bgColor = imagecolorallocate($image, 243, 244, 246); // #f3f4f6 - light gray
$textColor = imagecolorallocate($image, 102, 102, 102); // #666 - dark gray
$borderColor = imagecolorallocate($image, 209, 213, 219); // #d1d5db - border gray

// Fill background
imagefill($image, 0, 0, $bgColor);

// Draw border
imagerectangle($image, 0, 0, $width - 1, $height - 1, $borderColor);

// Add text "No Image"
$fontSize = 5; // Built-in font size
$text = "No Image";
$textWidth = imagefontwidth($fontSize) * strlen($text);
$textHeight = imagefontheight($fontSize);
$x = ($width - $textWidth) / 2;
$y = ($height - $textHeight) / 2;

imagestring($image, $fontSize, $x, $y, $text, $textColor);

// Ensure directory exists
$uploadDir = __DIR__ . '/uploads/products';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Save image
$filePath = $uploadDir . '/default-product.png';
$success = imagepng($image, $filePath);

// Clean up
imagedestroy($image);

if ($success) {
    // Set permissions
    chmod($filePath, 0644);
    echo "<h1>✅ Placeholder Image Created Successfully!</h1>";
    echo "<p>File created at: <code>$filePath</code></p>";
    echo "<p>File size: " . filesize($filePath) . " bytes</p>";
    echo "<p><strong>⚠️ IMPORTANT: Delete this file (create_placeholder.php) after use for security!</strong></p>";
    echo "<p><a href='/backend/uploads/products/default-product.png'>View placeholder image</a></p>";
} else {
    echo "<h1>❌ Error Creating Placeholder Image</h1>";
    echo "<p>Please check file permissions for: <code>$uploadDir</code></p>";
    echo "<p>Required permissions: 755 for directory, 644 for file</p>";
}
?>

