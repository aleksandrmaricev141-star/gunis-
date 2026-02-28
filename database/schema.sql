CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS heroes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    name VARCHAR(60) NOT NULL,
    level INT NOT NULL DEFAULT 1,
    exp INT NOT NULL DEFAULT 0,
    glory INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_heroes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hero_stats (
    hero_id BIGINT UNSIGNED PRIMARY KEY,
    steppe_rage INT NOT NULL DEFAULT 1,
    nomad_blood INT NOT NULL DEFAULT 1,
    copper_scale INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_stats_hero FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hero_currencies (
    hero_id BIGINT UNSIGNED PRIMARY KEY,
    bronze_tips INT NOT NULL DEFAULT 500,
    kurgan_gold INT NOT NULL DEFAULT 10,
    spirit_dust INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_currencies_hero FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hero_amulets (
    hero_id BIGINT UNSIGNED PRIMARY KEY,
    amulet_level INT NOT NULL DEFAULT 1,
    xp_bonus_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    bronze_bonus_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_amulet_hero FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hero_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hero_id BIGINT UNSIGNED NOT NULL,
    item_name VARCHAR(80) NOT NULL,
    rarity ENUM('common','uncommon','rare') NOT NULL DEFAULT 'common',
    slot_type ENUM('spear','akinak','bow','helmet','armor','boots') NOT NULL,
    attack_bonus INT NOT NULL DEFAULT 0,
    hp_bonus INT NOT NULL DEFAULT 0,
    armor_bonus INT NOT NULL DEFAULT 0,
    is_equipped TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_items_hero FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wild_field_state (
    hero_id BIGINT UNSIGNED PRIMARY KEY,
    fights_used INT NOT NULL DEFAULT 0,
    cooldown_until DATETIME NULL,
    CONSTRAINT fk_wild_hero FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS battle_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hero_id BIGINT UNSIGNED NOT NULL,
    enemy_name VARCHAR(80) NOT NULL,
    won TINYINT(1) NOT NULL,
    exp_gained INT NOT NULL DEFAULT 0,
    bronze_gained INT NOT NULL DEFAULT 0,
    spirit_dust_gained INT NOT NULL DEFAULT 0,
    kurgan_gold_gained INT NOT NULL DEFAULT 0,
    combat_log TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_battle_hero FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE CASCADE
);
