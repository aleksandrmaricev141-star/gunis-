<?php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $path;
if ($path !== '/' && file_exists($file) && !is_dir($file)) {
    return false;
}
if (str_starts_with($path, '/api/')) {
    require __DIR__ . '/api.php';
    return true;
}
require __DIR__ . '/index.php';
