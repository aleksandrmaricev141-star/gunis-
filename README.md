# СКИФЫ — MVP Этап 1

Минимальный прототип текстовой браузерной RPG на стеке **HTML/CSS/JS + PHP 8 + MySQL 8**.

## Что реализовано
- Регистрация/логин/логаут (session-based).
- Герой с базовыми параметрами:
  - Ярость Степи (`steppe_rage`)
  - Кровь Кочевника (`nomad_blood`)
  - Медная Чешуя (`copper_scale`)
- Лагерь (линейная прокачка статов за бронзу).
- Дикое Поле:
  - серия до 15 боев,
  - после 15-го боя кулдаун 30 минут,
  - награды: опыт, бронза, шанс на пыль/золото.
- Оберег Шамана (кормление пылью, постоянные бонусы к XP и бронзе).
- Инвентарь + 6 слотов экипировки (стартерный набор выдается при регистрации).

## Структура
- `public/` — фронт + API entrypoint.
- `src/` — bootstrap и игровой сервис.
- `database/schema.sql` — схема MySQL 8.

## Быстрый старт
1. Создать БД, например `skify`.
2. Применить схему:
   ```bash
   mysql -u root -p skify < database/schema.sql
   ```
3. Запустить сервер:
   ```bash
   DB_HOST=127.0.0.1 DB_PORT=3306 DB_NAME=skify DB_USER=root DB_PASS= php -S 0.0.0.0:8000 public/router.php
   ```
4. Открыть `http://localhost:8000`.

## API (основные)
- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`
- `POST /api/training/upgrade`
- `POST /api/wild-field/fight`
- `POST /api/amulet/feed`
- `GET /api/inventory`
- `POST /api/equipment/equip`
- `POST /api/equipment/unequip`
