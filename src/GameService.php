<?php

declare(strict_types=1);

final class GameService
{
    public function __construct(private PDO $pdo)
    {
    }

    public function register(string $username, string $password, string $heroName): void
    {
        $username = trim($username);
        $heroName = trim($heroName);
        if ($username === '' || $heroName === '' || mb_strlen($password) < 6) {
            throw new RuntimeException('Заполните поля. Пароль минимум 6 символов.');
        }

        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare('INSERT INTO users (username, password_hash) VALUES (:username, :password_hash)');
            $stmt->execute([
                'username' => $username,
                'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            ]);
            $userId = (int) $this->pdo->lastInsertId();

            $this->pdo->prepare('INSERT INTO heroes (user_id, name) VALUES (:user_id, :name)')
                ->execute(['user_id' => $userId, 'name' => $heroName]);
            $heroId = (int) $this->pdo->lastInsertId();

            $this->pdo->prepare('INSERT INTO hero_stats (hero_id) VALUES (:hero_id)')->execute(['hero_id' => $heroId]);
            $this->pdo->prepare('INSERT INTO hero_currencies (hero_id) VALUES (:hero_id)')->execute(['hero_id' => $heroId]);
            $this->pdo->prepare('INSERT INTO hero_amulets (hero_id) VALUES (:hero_id)')->execute(['hero_id' => $heroId]);
            $this->pdo->prepare('INSERT INTO wild_field_state (hero_id) VALUES (:hero_id)')->execute(['hero_id' => $heroId]);

            $starterItems = [
                ['Копье Дозорного', 'spear', 2, 0, 0],
                ['Акинак Юнца', 'akinak', 1, 0, 0],
                ['Лук Кочевника', 'bow', 2, 0, 0],
                ['Медный Шлем', 'helmet', 0, 10, 1],
                ['Кожаный Панцирь', 'armor', 0, 20, 2],
                ['Боевые Сапоги', 'boots', 0, 8, 1],
            ];
            $itemStmt = $this->pdo->prepare(
                'INSERT INTO hero_items (hero_id, item_name, slot_type, attack_bonus, hp_bonus, armor_bonus, is_equipped) '
                . 'VALUES (:hero_id, :item_name, :slot_type, :attack_bonus, :hp_bonus, :armor_bonus, 1)'
            );
            foreach ($starterItems as [$name, $slot, $attack, $hp, $armor]) {
                $itemStmt->execute([
                    'hero_id' => $heroId,
                    'item_name' => $name,
                    'slot_type' => $slot,
                    'attack_bonus' => $attack,
                    'hp_bonus' => $hp,
                    'armor_bonus' => $armor,
                ]);
            }

            $this->pdo->commit();
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function login(string $username, string $password): int
    {
        $stmt = $this->pdo->prepare('SELECT id, password_hash FROM users WHERE username = :username');
        $stmt->execute(['username' => trim($username)]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['password_hash'])) {
            throw new RuntimeException('Неверный логин или пароль.');
        }
        return (int) $user['id'];
    }

    public function getHeroByUserId(int $userId): array
    {
        $stmt = $this->pdo->prepare('SELECT h.id, h.name, h.level, h.exp, s.steppe_rage, s.nomad_blood, s.copper_scale,
               c.bronze_tips, c.kurgan_gold, c.spirit_dust, a.amulet_level, a.xp_bonus_pct, a.bronze_bonus_pct,
               w.fights_used, w.cooldown_until
            FROM heroes h
            JOIN hero_stats s ON s.hero_id = h.id
            JOIN hero_currencies c ON c.hero_id = h.id
            JOIN hero_amulets a ON a.hero_id = h.id
            JOIN wild_field_state w ON w.hero_id = h.id
            WHERE h.user_id = :user_id');
        $stmt->execute(['user_id' => $userId]);
        $hero = $stmt->fetch();
        if (!$hero) {
            throw new RuntimeException('Герой не найден.');
        }

        $heroId = (int) $hero['id'];
        $eq = $this->equipmentBonuses($heroId);
        $hero['derived_attack'] = 8 + ((int) $hero['steppe_rage'] * 2) + $eq['attack'];
        $hero['derived_hp'] = 80 + ((int) $hero['nomad_blood'] * 12) + $eq['hp'];
        $hero['derived_armor'] = ((int) $hero['copper_scale']) + $eq['armor'];

        return $hero;
    }

    public function upgradeStat(int $userId, string $stat): array
    {
        $allowed = ['steppe_rage', 'nomad_blood', 'copper_scale'];
        if (!in_array($stat, $allowed, true)) {
            throw new RuntimeException('Неизвестный параметр.');
        }

        $hero = $this->getHeroByUserId($userId);
        $heroId = (int) $hero['id'];
        $current = (int) $hero[$stat];
        $cost = $this->trainingCost($stat, $current);

        if ((int) $hero['bronze_tips'] < $cost) {
            throw new RuntimeException('Недостаточно Бронзовых Наконечников.');
        }

        $this->pdo->beginTransaction();
        try {
            $this->pdo->exec("UPDATE hero_stats SET {$stat} = {$stat} + 1 WHERE hero_id = {$heroId}");
            $stmt = $this->pdo->prepare('UPDATE hero_currencies SET bronze_tips = bronze_tips - :cost WHERE hero_id = :hero_id');
            $stmt->execute(['cost' => $cost, 'hero_id' => $heroId]);
            $this->pdo->commit();
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }

        return ['cost' => $cost, 'stat' => $stat];
    }

    public function trainingCost(string $stat, int $level): int
    {
        return match ($stat) {
            'steppe_rage' => 50 + ($level * 25),
            'nomad_blood' => 40 + ($level * 20),
            'copper_scale' => 45 + ($level * 22),
            default => 999999,
        };
    }

    public function fightWildField(int $userId): array
    {
        $hero = $this->getHeroByUserId($userId);
        $heroId = (int) $hero['id'];
        $fightsUsed = (int) $hero['fights_used'];
        $cooldown = $hero['cooldown_until'];
        $now = new DateTimeImmutable('now');

        if ($fightsUsed >= 15 && $cooldown) {
            $cooldownAt = new DateTimeImmutable($cooldown);
            if ($cooldownAt > $now) {
                throw new RuntimeException('Конь устал. Отдых до ' . $cooldownAt->format('H:i:s'));
            }

            $this->pdo->prepare('UPDATE wild_field_state SET fights_used = 0, cooldown_until = NULL WHERE hero_id = :hero_id')
                ->execute(['hero_id' => $heroId]);
            $fightsUsed = 0;
        }

        if ($fightsUsed >= 15) {
            throw new RuntimeException('Лимит боев исчерпан.');
        }

        $enemyPool = ['Гоплит-дезертир', 'Дикий кабан', 'Кочевник-изгой', 'Красный Центурион'];
        $enemyName = $enemyPool[array_rand($enemyPool)];

        $attack = (int) $hero['derived_attack'];
        $defense = (int) $hero['derived_armor'];
        $heroHp = (int) $hero['derived_hp'];
        $enemyAttack = 6 + ((int) $hero['level'] * 2) + random_int(0, 5);
        $enemyDefense = 2 + (int) floor(((int) $hero['level']) * 1.5);
        $enemyHp = 55 + ((int) $hero['level'] * 8) + random_int(0, 30);

        $log = [];
        $turn = 1;
        while ($heroHp > 0 && $enemyHp > 0 && $turn <= 30) {
            $crit = random_int(1, 100) <= min(30, (int) $hero['steppe_rage']);
            $heroDmg = max(1, (int) round(($attack - ($enemyDefense * 0.5)) * (random_int(90, 110) / 100)));
            if ($crit) {
                $heroDmg = (int) round($heroDmg * 1.5);
            }
            $enemyHp -= $heroDmg;
            $log[] = "Ход {$turn}: Вы нанесли {$heroDmg}" . ($crit ? ' (крит)' : '') . ' урона.';
            if ($enemyHp <= 0) {
                break;
            }

            $enemyDmg = max(1, (int) round(($enemyAttack - ($defense * 0.5)) * (random_int(90, 110) / 100)));
            $heroHp -= $enemyDmg;
            $log[] = "Ход {$turn}: {$enemyName} нанес {$enemyDmg} урона.";
            $turn++;
        }

        $won = $heroHp > 0;
        $xpGain = $won ? random_int(15, 32) : random_int(5, 10);
        $bronzeGain = $won ? random_int(25, 55) : random_int(8, 20);
        $dustGain = $won && random_int(1, 100) <= 35 ? random_int(1, 3) : 0;
        $goldGain = $won && str_contains($enemyName, 'Красный') && random_int(1, 100) <= 4 ? 1 : 0;

        $xpGain = (int) round($xpGain * (1 + ((float) $hero['xp_bonus_pct'] / 100)));
        $bronzeGain = (int) round($bronzeGain * (1 + ((float) $hero['bronze_bonus_pct'] / 100)));

        $this->pdo->beginTransaction();
        try {
            $this->pdo->prepare('UPDATE hero_currencies
                    SET bronze_tips = bronze_tips + :bronze,
                        spirit_dust = spirit_dust + :dust,
                        kurgan_gold = kurgan_gold + :gold
                    WHERE hero_id = :hero_id')
                ->execute([
                    'bronze' => $bronzeGain,
                    'dust' => $dustGain,
                    'gold' => $goldGain,
                    'hero_id' => $heroId,
                ]);

            $this->pdo->prepare('UPDATE heroes SET exp = exp + :xp WHERE id = :hero_id')
                ->execute(['xp' => $xpGain, 'hero_id' => $heroId]);

            $fightsUsed++;
            $cooldownUntil = null;
            if ($fightsUsed >= 15) {
                $cooldownUntil = $now->modify('+30 minutes')->format('Y-m-d H:i:s');
            }

            $this->pdo->prepare('UPDATE wild_field_state SET fights_used = :used, cooldown_until = :cooldown WHERE hero_id = :hero_id')
                ->execute([
                    'used' => $fightsUsed,
                    'cooldown' => $cooldownUntil,
                    'hero_id' => $heroId,
                ]);

            $this->pdo->prepare('INSERT INTO battle_logs
                    (hero_id, enemy_name, won, exp_gained, bronze_gained, spirit_dust_gained, kurgan_gold_gained, combat_log)
                    VALUES (:hero_id, :enemy_name, :won, :xp, :bronze, :dust, :gold, :combat_log)')
                ->execute([
                    'hero_id' => $heroId,
                    'enemy_name' => $enemyName,
                    'won' => $won ? 1 : 0,
                    'xp' => $xpGain,
                    'bronze' => $bronzeGain,
                    'dust' => $dustGain,
                    'gold' => $goldGain,
                    'combat_log' => implode("\n", $log),
                ]);

            $this->applyLevelUps($heroId);
            $this->pdo->commit();
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }

        return [
            'won' => $won,
            'enemy_name' => $enemyName,
            'xp_gain' => $xpGain,
            'bronze_gain' => $bronzeGain,
            'dust_gain' => $dustGain,
            'gold_gain' => $goldGain,
            'fights_used' => $fightsUsed,
            'cooldown_until' => $cooldownUntil,
            'combat_log' => $log,
        ];
    }

    public function feedAmulet(int $userId, int $dust): array
    {
        if ($dust <= 0) {
            throw new RuntimeException('Укажите количество пыли больше нуля.');
        }

        $hero = $this->getHeroByUserId($userId);
        $heroId = (int) $hero['id'];
        $availableDust = (int) $hero['spirit_dust'];
        if ($availableDust < $dust) {
            throw new RuntimeException('Недостаточно Слез Духов.');
        }

        $this->pdo->beginTransaction();
        try {
            $this->pdo->prepare('UPDATE hero_currencies SET spirit_dust = spirit_dust - :dust WHERE hero_id = :hero_id')
                ->execute(['dust' => $dust, 'hero_id' => $heroId]);

            $amuletLevel = (int) $hero['amulet_level'];
            $consumed = 0;
            while (($dust - $consumed) >= $this->amuletUpgradeCost($amuletLevel)) {
                $consumed += $this->amuletUpgradeCost($amuletLevel);
                $amuletLevel++;
            }

            if ($amuletLevel > (int) $hero['amulet_level']) {
                $levelsGained = $amuletLevel - (int) $hero['amulet_level'];
                $this->pdo->prepare('UPDATE hero_amulets
                        SET amulet_level = :level,
                            xp_bonus_pct = xp_bonus_pct + :bonus,
                            bronze_bonus_pct = bronze_bonus_pct + :bonus
                        WHERE hero_id = :hero_id')
                    ->execute([
                        'level' => $amuletLevel,
                        'bonus' => $levelsGained,
                        'hero_id' => $heroId,
                    ]);
            }

            $this->pdo->commit();
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }

        return ['fed_dust' => $dust];
    }

    public function listItems(int $userId): array
    {
        $hero = $this->getHeroByUserId($userId);
        $stmt = $this->pdo->prepare('SELECT id, item_name, rarity, slot_type, attack_bonus, hp_bonus, armor_bonus, is_equipped
            FROM hero_items WHERE hero_id = :hero_id ORDER BY is_equipped DESC, id ASC');
        $stmt->execute(['hero_id' => $hero['id']]);
        return $stmt->fetchAll();
    }

    public function equipItem(int $userId, int $itemId): void
    {
        $hero = $this->getHeroByUserId($userId);
        $stmt = $this->pdo->prepare('SELECT id, slot_type FROM hero_items WHERE id = :id AND hero_id = :hero_id');
        $stmt->execute(['id' => $itemId, 'hero_id' => $hero['id']]);
        $item = $stmt->fetch();
        if (!$item) {
            throw new RuntimeException('Предмет не найден.');
        }

        $this->pdo->beginTransaction();
        try {
            $this->pdo->prepare('UPDATE hero_items SET is_equipped = 0 WHERE hero_id = :hero_id AND slot_type = :slot_type')
                ->execute(['hero_id' => $hero['id'], 'slot_type' => $item['slot_type']]);
            $this->pdo->prepare('UPDATE hero_items SET is_equipped = 1 WHERE id = :id')->execute(['id' => $itemId]);
            $this->pdo->commit();
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function unequipSlot(int $userId, string $slot): void
    {
        $hero = $this->getHeroByUserId($userId);
        $allowed = ['spear', 'akinak', 'bow', 'helmet', 'armor', 'boots'];
        if (!in_array($slot, $allowed, true)) {
            throw new RuntimeException('Неизвестный слот.');
        }
        $this->pdo->prepare('UPDATE hero_items SET is_equipped = 0 WHERE hero_id = :hero_id AND slot_type = :slot')
            ->execute(['hero_id' => $hero['id'], 'slot' => $slot]);
    }

    private function equipmentBonuses(int $heroId): array
    {
        $stmt = $this->pdo->prepare('SELECT
            COALESCE(SUM(attack_bonus),0) AS attack,
            COALESCE(SUM(hp_bonus),0) AS hp,
            COALESCE(SUM(armor_bonus),0) AS armor
            FROM hero_items WHERE hero_id = :hero_id AND is_equipped = 1');
        $stmt->execute(['hero_id' => $heroId]);
        return $stmt->fetch() ?: ['attack' => 0, 'hp' => 0, 'armor' => 0];
    }

    private function applyLevelUps(int $heroId): void
    {
        $stmt = $this->pdo->prepare('SELECT level, exp FROM heroes WHERE id = :hero_id');
        $stmt->execute(['hero_id' => $heroId]);
        $hero = $stmt->fetch();
        if (!$hero) {
            return;
        }

        $level = (int) $hero['level'];
        $exp = (int) $hero['exp'];
        while ($exp >= $this->requiredExpForLevel($level)) {
            $exp -= $this->requiredExpForLevel($level);
            $level++;
        }

        $this->pdo->prepare('UPDATE heroes SET level = :level, exp = :exp WHERE id = :hero_id')
            ->execute(['level' => $level, 'exp' => $exp, 'hero_id' => $heroId]);
    }

    private function requiredExpForLevel(int $level): int
    {
        return 100 * $level;
    }

    private function amuletUpgradeCost(int $level): int
    {
        return 20 + ($level * 10);
    }
}
