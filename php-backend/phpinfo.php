<?php
header('Content-Type: text/plain');

echo "PHP Version: " . phpversion() . "\n\n";

echo "PDO Extension: " . (extension_loaded('pdo') ? 'LOADED' : 'NOT LOADED') . "\n";
echo "PDO MySQL Extension: " . (extension_loaded('pdo_mysql') ? 'LOADED' : 'NOT LOADED') . "\n\n";

echo "Loaded Extensions:\n";
foreach (get_loaded_extensions() as $ext) {
    echo "  - $ext\n";
}

echo "\n\nConfiguration File (php.ini) Path:\n";
echo php_ini_loaded_file() ?: '(none)' . "\n";

echo "\n\nAdditional .ini files parsed:\n";
echo php_ini_scanned_files() ?: '(none)' . "\n";

echo "\n\nExtension Directory:\n";
echo ini_get('extension_dir') . "\n";
