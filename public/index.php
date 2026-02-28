<!doctype html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>СКИФЫ — MVP</title>
    <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
<div class="container">
    <h1>СКИФЫ — Этап 1 MVP</h1>

    <section class="card" id="auth-card">
        <h2>Вход / Регистрация</h2>
        <div class="row">
            <input id="username" placeholder="Логин">
            <input id="password" type="password" placeholder="Пароль (6+)">
            <input id="hero_name" placeholder="Имя героя">
        </div>
        <div class="row">
            <button id="register-btn">Регистрация</button>
            <button id="login-btn">Войти</button>
            <button id="logout-btn">Выйти</button>
        </div>
    </section>

    <section class="card" id="hero-card">
        <h2>Герой</h2>
        <pre id="hero-info">Авторизуйтесь...</pre>
    </section>

    <section class="card">
        <h2>Лагерь — Тренировка</h2>
        <div class="row">
            <button class="upgrade" data-stat="steppe_rage">Ярость Степи +1</button>
            <button class="upgrade" data-stat="nomad_blood">Кровь Кочевника +1</button>
            <button class="upgrade" data-stat="copper_scale">Медная Чешуя +1</button>
        </div>
    </section>

    <section class="card">
        <h2>Дикое Поле</h2>
        <button id="fight-btn">Выйти в дозор (бой)</button>
        <pre id="battle-log">Здесь будут логи сражений...</pre>
    </section>

    <section class="card">
        <h2>Оберег Шамана</h2>
        <div class="row">
            <input id="dust" type="number" min="1" value="1">
            <button id="feed-amulet">Скормить Слезы Духов</button>
        </div>
    </section>

    <section class="card">
        <h2>Инвентарь и Экипировка</h2>
        <button id="refresh-inventory">Обновить инвентарь</button>
        <pre id="inventory-info">Пусто</pre>
    </section>

    <p id="status"></p>
</div>
<script src="/assets/app.js"></script>
</body>
</html>
