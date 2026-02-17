<?php

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

$data = requestJson();
$attacker = $data['attacker'] ?? [];
$defender = $data['defender'] ?? [];

if (!is_array($attacker) || !is_array($defender)) {
    jsonResponse(['error' => 'Некорректные данные'], 422);
}

$atkStats = calculateDerivedStats($attacker['stats'] ?? [], (string) ($attacker['class'] ?? 'warrior'), (int) ($attacker['level'] ?? 1), (int) ($attacker['gear_bonus'] ?? 0));
$defStats = calculateDerivedStats($defender['stats'] ?? [], (string) ($defender['class'] ?? 'defender'), (int) ($defender['level'] ?? 1), (int) ($defender['gear_bonus'] ?? 0));

$atkHp = $atkStats['hp'];
$defHp = $defStats['hp'];
$round = 1;
$log = [];

while ($atkHp > 0 && $defHp > 0 && $round <= 30) {
    $atkInitiative = random_int(1, 100) + (int) (($attacker['stats']['agility'] ?? 0) * 0.7);
    $defInitiative = random_int(1, 100) + (int) (($defender['stats']['agility'] ?? 0) * 0.7);

    $order = $atkInitiative >= $defInitiative
        ? [['name' => 'attacker', 'stats' => $atkStats], ['name' => 'defender', 'stats' => $defStats]]
        : [['name' => 'defender', 'stats' => $defStats], ['name' => 'attacker', 'stats' => $atkStats]];

    foreach ($order as $unit) {
        if ($atkHp <= 0 || $defHp <= 0) {
            break;
        }

        $isAttacker = $unit['name'] === 'attacker';
        $baseDamage = $unit['stats']['damage'];
        $targetAntiCrit = $isAttacker ? $defStats['anti_crit_percent'] : $atkStats['anti_crit_percent'];

        $critRoll = random_int(1, 10000) / 100;
        $critChance = max(0.0, $unit['stats']['crit_percent'] - $targetAntiCrit);
        $isCrit = $critRoll <= $critChance;

        $evasionRoll = random_int(1, 100);
        $evasionChance = 5 + (int) (($isAttacker ? ($defender['stats']['agility'] ?? 0) : ($attacker['stats']['agility'] ?? 0)) * 0.1);
        if ($evasionRoll <= $evasionChance) {
            $log[] = "Раунд {$round}: {$unit['name']} промахивается (уклонение цели).";
            continue;
        }

        $penetration = random_int(0, 15);
        $mitigation = max(0, 10 - $penetration);
        $finalDamage = max(1, (int) round(($baseDamage * ($isCrit ? 1.7 : 1.0)) - $mitigation));

        if ($isAttacker) {
            $defHp -= $finalDamage;
            $log[] = "Раунд {$round}: attacker наносит {$finalDamage}" . ($isCrit ? ' критического' : '') . " урона defender.";
        } else {
            $atkHp -= $finalDamage;
            $log[] = "Раунд {$round}: defender наносит {$finalDamage}" . ($isCrit ? ' критического' : '') . " урона attacker.";
        }
    }

    $round++;
}

$winner = $atkHp === $defHp ? 'draw' : ($atkHp > $defHp ? 'attacker' : 'defender');

jsonResponse([
    'ok' => true,
    'winner' => $winner,
    'rounds' => $round - 1,
    'attacker_hp' => max(0, $atkHp),
    'defender_hp' => max(0, $defHp),
    'attacker_derived' => $atkStats,
    'defender_derived' => $defStats,
    'log' => $log,
]);
