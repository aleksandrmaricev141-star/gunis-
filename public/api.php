<?php

declare(strict_types=1);

session_start();

require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/GameService.php';

$service = new GameService(db());
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$body = json_input();

try {
    if ($path === '/api/register' && $method === 'POST') {
        $service->register((string) ($body['username'] ?? ''), (string) ($body['password'] ?? ''), (string) ($body['hero_name'] ?? ''));
        respond(['ok' => true]);
    }

    if ($path === '/api/login' && $method === 'POST') {
        $userId = $service->login((string) ($body['username'] ?? ''), (string) ($body['password'] ?? ''));
        $_SESSION['user_id'] = $userId;
        respond(['ok' => true]);
    }

    if ($path === '/api/logout' && $method === 'POST') {
        session_destroy();
        respond(['ok' => true]);
    }

    if ($path === '/api/me' && $method === 'GET') {
        $userId = require_auth();
        respond(['ok' => true, 'hero' => $service->getHeroByUserId($userId)]);
    }

    if ($path === '/api/training/upgrade' && $method === 'POST') {
        $userId = require_auth();
        $result = $service->upgradeStat($userId, (string) ($body['stat'] ?? ''));
        respond(['ok' => true, 'result' => $result]);
    }

    if ($path === '/api/wild-field/fight' && $method === 'POST') {
        $userId = require_auth();
        $battle = $service->fightWildField($userId);
        respond(['ok' => true, 'battle' => $battle]);
    }

    if ($path === '/api/amulet/feed' && $method === 'POST') {
        $userId = require_auth();
        $result = $service->feedAmulet($userId, (int) ($body['dust'] ?? 0));
        respond(['ok' => true, 'result' => $result]);
    }

    if ($path === '/api/inventory' && $method === 'GET') {
        $userId = require_auth();
        respond(['ok' => true, 'items' => $service->listItems($userId)]);
    }

    if ($path === '/api/equipment/equip' && $method === 'POST') {
        $userId = require_auth();
        $service->equipItem($userId, (int) ($body['item_id'] ?? 0));
        respond(['ok' => true]);
    }

    if ($path === '/api/equipment/unequip' && $method === 'POST') {
        $userId = require_auth();
        $service->unequipSlot($userId, (string) ($body['slot'] ?? ''));
        respond(['ok' => true]);
    }

    respond(['ok' => false, 'error' => 'Не найдено'], 404);
} catch (Throwable $e) {
    respond(['ok' => false, 'error' => $e->getMessage()], 400);
}
