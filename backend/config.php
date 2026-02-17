<?php

declare(strict_types=1);

const APP_SECRET = 'scythians_super_secret_change_me';
const JWT_TTL_SECONDS = 3600;
const DB_PATH = __DIR__ . '/../data/scythians.sqlite';

const CLASSES = [
    'warrior' => ['coef' => 1.35, 'specs' => ['Берсерк', 'Страж', 'Дуэлянт']],
    'archer' => ['coef' => 1.25, 'specs' => ['Снайпер', 'Следопыт', 'Кочевник']],
    'defender' => ['coef' => 1.10, 'specs' => ['Каменная стена', 'Провокатор', 'Командир']],
    'rider' => ['coef' => 1.30, 'specs' => ['Разрушитель строя', 'Кавалерист поддержки', 'Налётчик']],
];

const FACTIONS = ['Степные кланы', 'Северные варвары', 'Остатки Империи'];
