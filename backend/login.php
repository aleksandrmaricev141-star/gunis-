<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$pdo = db();
initSchema($pdo);

$data = requestJson();
$email = mb_strtolower(trim((string) ($data['email'] ?? '')));
$password = (string) ($data['password'] ?? '');
$ip = getClientIp();

if ($email === '' || $password === '') {
    jsonResponse(['error' => 'Email и пароль обязательны'], 422);
}

$windowStart = time() - 15 * 60;
$limitStmt = $pdo->prepare('SELECT COUNT(*) FROM login_attempts WHERE (email = :email OR ip = :ip) AND attempted_at >= :window_start');
$limitStmt->execute([':email' => $email, ':ip' => $ip, ':window_start' => $windowStart]);
$attemptCount = (int) $limitStmt->fetchColumn();

if ($attemptCount >= 10) {
    jsonResponse(['error' => 'Слишком много попыток входа. Повторите позже.'], 429);
}

$attemptStmt = $pdo->prepare('INSERT INTO login_attempts(email, ip, attempted_at) VALUES(:email, :ip, :attempted_at)');
$attemptStmt->execute([':email' => $email, ':ip' => $ip, ':attempted_at' => time()]);

$stmt = $pdo->prepare('SELECT id, name, email, password_hash, class, faction FROM users WHERE email = :email');
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    jsonResponse(['error' => 'Неверный логин или пароль'], 401);
}

$token = createJwt([
    'sub' => (int) $user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'class' => $user['class'],
    'faction' => $user['faction'],
]);

jsonResponse([
    'ok' => true,
    'token' => $token,
    'expires_in' => JWT_TTL_SECONDS,
]);
