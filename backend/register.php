<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$pdo = db();
initSchema($pdo);

$data = requestJson();
$name = trim((string) ($data['name'] ?? ''));
$email = mb_strtolower(trim((string) ($data['email'] ?? '')));
$password = (string) ($data['password'] ?? '');
$passwordConfirm = (string) ($data['password_confirm'] ?? '');
$faction = (string) ($data['faction'] ?? '');
$class = (string) ($data['class'] ?? '');

if ($name === '' || $email === '' || $password === '' || $passwordConfirm === '') {
    jsonResponse(['error' => 'Заполните все обязательные поля'], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'Некорректный email'], 422);
}

if ($password !== $passwordConfirm) {
    jsonResponse(['error' => 'Пароли не совпадают'], 422);
}

if (!validatePassword($password)) {
    jsonResponse(['error' => 'Пароль должен быть не менее 8 символов, включать верхний/нижний регистр и цифру'], 422);
}

if (!in_array($faction, FACTIONS, true)) {
    jsonResponse(['error' => 'Некорректная фракция'], 422);
}

if (!array_key_exists($class, CLASSES)) {
    jsonResponse(['error' => 'Некорректный класс'], 422);
}

$existsStmt = $pdo->prepare('SELECT id FROM users WHERE email = :email');
$existsStmt->execute([':email' => $email]);
if ($existsStmt->fetch()) {
    jsonResponse(['error' => 'Пользователь с таким email уже существует'], 409);
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$now = gmdate('c');

$pdo->beginTransaction();
$userStmt = $pdo->prepare('INSERT INTO users(name, email, password_hash, faction, class, created_at) VALUES(:name, :email, :password_hash, :faction, :class, :created_at)');
$userStmt->execute([
    ':name' => $name,
    ':email' => $email,
    ':password_hash' => $hash,
    ':faction' => $faction,
    ':class' => $class,
    ':created_at' => $now,
]);

$userId = (int) $pdo->lastInsertId();
$charStmt = $pdo->prepare('INSERT INTO characters(user_id, class, specialization) VALUES(:user_id, :class, :spec)');
$charStmt->execute([
    ':user_id' => $userId,
    ':class' => $class,
    ':spec' => CLASSES[$class]['specs'][0],
]);
$characterId = (int) $pdo->lastInsertId();

$statStmt = $pdo->prepare('INSERT INTO stats(character_id, strength, agility, stamina, intellect, spirit, luck) VALUES(:character_id, 10, 10, 10, 10, 10, 10)');
$statStmt->execute([':character_id' => $characterId]);
$pdo->commit();

jsonResponse([
    'ok' => true,
    'message' => 'Регистрация успешна. Подтверждение email добавляется на следующем этапе.',
    'user_id' => $userId,
]);
