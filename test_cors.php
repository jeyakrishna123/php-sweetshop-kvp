<?php
$url = 'http://localhost:8000/uploads/menu-items/68f195ba1170a_1760662970.webp';

$context = stream_context_create([
    'http' => [
        'method' => 'HEAD'
    ]
]);

$headers = get_headers($url, 1, $context);

echo "Response Headers:\n";
echo str_repeat('=', 80) . "\n";

foreach ($headers as $key => $value) {
    if (is_array($value)) {
        foreach ($value as $v) {
            echo "$key: $v\n";
        }
    } else {
        echo "$key: $value\n";
    }
}
?>
