<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

$pdo = db();
initSchema($pdo);

echo "Database initialized at " . DB_PATH . PHP_EOL;
