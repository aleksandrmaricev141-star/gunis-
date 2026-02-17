<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function jsonResponse(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function requestJson(): array
{
    $raw = file_get_contents('php://input');
    $decoded = json_decode($raw ?: '[]', true);
    return is_array($decoded) ? $decoded : [];
}

function base64UrlEncode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function createJwt(array $claims): string
{
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $payload = $claims;
    $payload['exp'] = time() + JWT_TTL_SECONDS;

    $headerB64 = base64UrlEncode((string) json_encode($header));
    $payloadB64 = base64UrlEncode((string) json_encode($payload, JSON_UNESCAPED_UNICODE));
    $signature = hash_hmac('sha256', $headerB64 . '.' . $payloadB64, APP_SECRET, true);

    return $headerB64 . '.' . $payloadB64 . '.' . base64UrlEncode($signature);
}

function getClientIp(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function validatePassword(string $password): bool
{
    return strlen($password) >= 8
        && preg_match('/[A-Z]/u', $password) === 1
        && preg_match('/[a-z]/u', $password) === 1
        && preg_match('/\d/u', $password) === 1;
}

function classCoef(string $class): float
{
    return CLASSES[$class]['coef'] ?? 1.0;
}

function calculateDerivedStats(array $stats, string $class, int $level, int $gearBonus = 0): array
{
    $strength = (int) ($stats['strength'] ?? 0);
    $agility = (int) ($stats['agility'] ?? 0);
    $stamina = (int) ($stats['stamina'] ?? 0);

    $damage = ($strength * classCoef($class)) + ($level * 2.5) + $gearBonus;
    $hp = ($stamina * 12) + ($level * 15);
    $crit = $agility * 0.04;
    $anticrit = $stamina * 0.02;

    return [
        'damage' => round($damage, 2),
        'hp' => $hp,
        'crit_percent' => round($crit, 2),
        'anti_crit_percent' => round($anticrit, 2),
    ];
}
