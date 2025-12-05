<?php
require_once 'php-backend/config/database.php';

$db = Database::getInstance()->getConnection();
$stmt = $db->query('SHOW CREATE TABLE products');
$result = $stmt->fetch();

echo $result['Create Table'];
