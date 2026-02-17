<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    if (!is_dir(dirname(DB_PATH))) {
        mkdir(dirname(DB_PATH), 0775, true);
    }

    $pdo = new PDO('sqlite:' . DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    return $pdo;
}

function initSchema(PDO $pdo): void
{
    $schema = [
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            faction TEXT NOT NULL,
            class TEXT NOT NULL,
            email_verified INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        )",
        "CREATE TABLE IF NOT EXISTS characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            level INTEGER NOT NULL DEFAULT 1,
            class TEXT NOT NULL,
            specialization TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )",
        "CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL,
            strength INTEGER NOT NULL,
            agility INTEGER NOT NULL,
            stamina INTEGER NOT NULL,
            intellect INTEGER NOT NULL,
            spirit INTEGER NOT NULL,
            luck INTEGER NOT NULL,
            FOREIGN KEY(character_id) REFERENCES characters(id)
        )",
        "CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, rarity TEXT, slot TEXT)",
        "CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY AUTOINCREMENT, character_id INTEGER, item_id INTEGER)",
        "CREATE TABLE IF NOT EXISTS clans (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, tax_percent INTEGER DEFAULT 5)",
        "CREATE TABLE IF NOT EXISTS clan_members (id INTEGER PRIMARY KEY AUTOINCREMENT, clan_id INTEGER, user_id INTEGER, role TEXT)",
        "CREATE TABLE IF NOT EXISTS clan_buildings (id INTEGER PRIMARY KEY AUTOINCREMENT, clan_id INTEGER, building_type TEXT, level INTEGER)",
        "CREATE TABLE IF NOT EXISTS territories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, owner_clan_id INTEGER, passive_income INTEGER DEFAULT 0)",
        "CREATE TABLE IF NOT EXISTS battles (id INTEGER PRIMARY KEY AUTOINCREMENT, attacker_id INTEGER, defender_id INTEGER, result TEXT, log TEXT, created_at TEXT)",
        "CREATE TABLE IF NOT EXISTS raid_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, raid_name TEXT, participants INTEGER, outcome TEXT, created_at TEXT)",
        "CREATE TABLE IF NOT EXISTS economy_transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, currency TEXT, amount INTEGER, reason TEXT, created_at TEXT)",
        "CREATE TABLE IF NOT EXISTS auction (id INTEGER PRIMARY KEY AUTOINCREMENT, seller_id INTEGER, item_id INTEGER, price INTEGER, status TEXT)",
        "CREATE TABLE IF NOT EXISTS skills (id INTEGER PRIMARY KEY AUTOINCREMENT, class TEXT, name TEXT, power_coeff REAL)",
        "CREATE TABLE IF NOT EXISTS buffs (id INTEGER PRIMARY KEY AUTOINCREMENT, character_id INTEGER, name TEXT, value REAL, expires_at TEXT)",
        "CREATE TABLE IF NOT EXISTS seasons (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, starts_at TEXT, ends_at TEXT, is_active INTEGER)",
        "CREATE TABLE IF NOT EXISTS rankings (id INTEGER PRIMARY KEY AUTOINCREMENT, character_id INTEGER, rating INTEGER, season_id INTEGER)",
        "CREATE TABLE IF NOT EXISTS login_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            ip TEXT NOT NULL,
            attempted_at INTEGER NOT NULL
        )"
    ];

    foreach ($schema as $sql) {
        $pdo->exec($sql);
    }
}
