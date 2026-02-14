import { state } from '../modules/state.js';
import { format } from '../modules/utils.js';
import { rejectOrder, takeOrder } from '../modules/orders.js';
import { createCompany, donateToGuild, startGuildRaid, upgradeCompany, upgradeGuild } from '../modules/company.js';
import { setChannelBudget } from '../modules/ads.js';
import { log } from './logger.js';

let currentTab = 'home';

export function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
      currentTab = button.dataset.tab;
      updateNavState();
      render();
    });
  });
}

function updateNavState() {
  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === currentTab);
  });
}

export function render() {
  updateNavState();
  renderStats();

  const root = document.getElementById('screenContent');
  root.innerHTML = '';

  if (currentTab === 'home') return renderHome(root);
  if (currentTab === 'company') return renderCompanyTab(root);
  if (currentTab === 'profile') return renderProfileTab(root);
  if (currentTab === 'admin') return renderAdminTab(root);
  if (currentTab === 'corp-rating') return root.appendChild(makeInDevelopmentPanel('Рейтинг корпораций в разработке'));
  if (currentTab === 'rating') return root.appendChild(makeInDevelopmentPanel('Глобальный рейтинг в разработке'));
}

function renderHome(root) {
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.innerHTML = `
    <h2>📂 Разделы главного экрана</h2>
    <div class="menu-list">
      <button class="menu-item ghost" data-open="ads">📢 Реклама</button>
      <button class="menu-item ghost" data-open="orders">🧾 Заказы</button>
    </div>
    <p class="hint">Метрики и лог убраны из Главной. Они доступны в Профиле/Админе.</p>
  `;

  panel.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => openWindow(btn.dataset.open));
  });

  root.appendChild(panel);
}

function openWindow(type) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `<b>${type === 'ads' ? '📢 Реклама' : '🧾 Заказы'}</b>`;

  const close = document.createElement('button');
  close.textContent = '✖';
  close.className = 'secondary';
  close.onclick = () => overlay.remove();
  header.appendChild(close);

  const body = document.createElement('div');
  body.className = 'modal-body';
  if (type === 'ads') body.appendChild(renderAdsPanel());
  if (type === 'orders') body.appendChild(renderOrdersPanel());

  modal.append(header, body);
  overlay.appendChild(modal);
  document.querySelector('.game-frame').appendChild(overlay);
}

function renderAdsPanel() {
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.innerHTML = '<p class="hint">Бюджет канала влияет на цену лида, конверсию и итоговую маржу.</p>';

  const grid = document.createElement('div');
  grid.className = 'grid';

  state.adChannels.forEach((channel) => {
    const card = document.createElement('article');
    card.className = 'card';

    if (!channel.unlocked) {
      card.innerHTML = `<b>${channel.name}</b><p>Откроется при репутации ${channel.unlockRep}</p>`;
      grid.appendChild(card);
      return;
    }

    const leadCost = Math.round(channel.costPerLead * (1 + (channel.budget - 1) * 0.24));
    card.innerHTML = `
      <b>${channel.name}</b>
      <p>Запуск: ${format(channel.launchCost)}₽</p>
      <p>Цена лида: ${format(leadCost)}₽</p>
      <p>Конверсия: ${Math.round(channel.conversion * 100)}%</p>
      <p>Бюджет: ${channel.budget}/5</p>
      <div class="actions">
        <button class="secondary" data-budget="-1">- бюджет</button>
        <button class="secondary" data-budget="1">+ бюджет</button>
      </div>
    `;

    card.querySelectorAll('[data-budget]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setChannelBudget(channel.id, Number(btn.dataset.budget));
        render();
      });
    });

    const button = document.createElement('button');
    if (!channel.active) {
      button.textContent = 'Запустить';
      button.disabled = state.money < channel.launchCost;
      button.onclick = () => {
        state.money -= channel.launchCost;
        channel.active = true;
        render();
      };
    } else {
      button.textContent = 'Остановить';
      button.className = 'secondary';
      button.onclick = () => {
        channel.active = false;
        render();
      };
    }

    card.appendChild(button);
    grid.appendChild(card);
  });

  panel.appendChild(grid);
  return panel;
}

function renderOrdersPanel() {
  const panel = document.createElement('section');
  panel.className = 'panel';

  const columns = document.createElement('div');
  columns.className = 'two-col';
  columns.innerHTML = `<div><h3>Новые заявки</h3><div id="orderList" class="list"></div></div><div><h3>Активные работы</h3><div id="activeList" class="list"></div></div>`;

  panel.appendChild(columns);
  fillOrders(columns.querySelector('#orderList'));
  fillActiveOrders(columns.querySelector('#activeList'));
  return panel;
}

function fillOrders(root) {
  root.innerHTML = '';
  if (!state.orders.length) {
    root.innerHTML = '<div class="item"><small>Нет заказов. Запусти рекламу.</small></div>';
    return;
  }

  state.orders.slice(0, 8).forEach((order) => {
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `<b>${order.type}</b><small>Цена: ${format(order.price)}₽ · Время: ${order.duration} тиков · Риск: ${Math.round(order.baseRisk * 100)}%</small>`;
    const actions = document.createElement('div');
    actions.className = 'actions';
    const accept = document.createElement('button');
    accept.textContent = 'Взять';
    accept.onclick = () => takeOrder(order.id);
    const reject = document.createElement('button');
    reject.textContent = 'Отказ';
    reject.className = 'secondary';
    reject.onclick = () => rejectOrder(order.id);
    actions.append(accept, reject);
    item.appendChild(actions);
    root.appendChild(item);
  });
}

function fillActiveOrders(root) {
  root.innerHTML = '';
  if (!state.activeOrders.length) {
    root.innerHTML = '<div class="item"><small>Нет активных заказов.</small></div>';
    return;
  }

  state.activeOrders.forEach((order) => {
    const progress = Math.round((order.progress / order.duration) * 100);
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `<b>${order.type}</b><small>${progress}% · ${order.progress}/${order.duration} тиков</small>`;
    root.appendChild(item);
  });
}

function renderCompanyTab(root) {
  const panel = document.createElement('section');
  panel.className = 'panel';

  if (!state.company.inCompany) {
    panel.innerHTML = `
      <h2>🏢 Компания</h2>
      <p class="hint">Ты пока не в компании. Можешь создать свою за <b>500$</b>.</p>
      <button id="createCompanyBtn">Создать компанию за 500$</button>
    `;
    panel.querySelector('#createCompanyBtn').addEventListener('click', () => {
      const result = createCompany('MasterRush Service');
      if (!result.ok) log('❌ Недостаточно долларов для создания компании.', 'bad');
      render();
    });
    root.appendChild(panel);
    return;
  }

  const g = state.company.guild;
  panel.innerHTML = `
    <h2>🏢 ${state.company.name}</h2>
    <div class="company">
      <div>Должность: <span class="badge">${state.company.rank}</span></div>
      <div>Сотрудники: <b>${state.company.members}</b> · Пассивный доход: <b>${format(state.company.passiveIncome)} ₽/тик</b></div>
      <div>Реклама ур.: <b>${state.company.adLevel}</b> · Логистика ур.: <b>${state.company.logisticsLevel}</b></div>
      <div>HR ур.: <b>${state.company.hrLevel}</b> · Склад ур.: <b>${state.company.warehouseLevel}</b></div>
    </div>

    <h3>🛡 Гильдия компании</h3>
    <div class="company">
      <div>Уровень гильдии: <b>${g.level}</b> · Участники: <b>${g.members}</b></div>
      <div>Очки: <b>${format(g.points)}</b> · Казна: <b>${format(g.treasury)} ₽</b></div>
      <div>Квест: <b>${format(g.questProgress)} / ${format(g.questGoal)}</b></div>
      <div>Рейд CD: <b>${g.raidCooldown}</b> тиков · Лог-маршруты: <b>${g.logisticsRoute}</b></div>
    </div>

    <div class="menu-list">
      <button data-up="adLevel">⬆️ Реклама компании</button>
      <button data-up="logisticsLevel">⬆️ Логистика</button>
      <button data-up="hrLevel">⬆️ Найм (HR)</button>
      <button data-up="warehouseLevel">⬆️ Склад и инструменты</button>
      <button data-guild="donate">🤝 Донат 200₽ в гильдию</button>
      <button data-guild="raid">⚔️ Гильдейский рейд</button>
      <button data-guild="upgrade">🏰 Улучшить гильдию</button>
    </div>
  `;

  panel.querySelectorAll('[data-up]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const result = upgradeCompany(btn.dataset.up);
      if (!result.ok) log('⚠️ Недостаточно средств для апгрейда компании.', 'warn');
      render();
    });
  });

  panel.querySelector('[data-guild="donate"]').addEventListener('click', () => {
    const r = donateToGuild(200);
    if (!r.ok) log('⚠️ Нельзя сделать донат в гильдию.', 'warn');
    render();
  });
  panel.querySelector('[data-guild="raid"]').addEventListener('click', () => {
    const r = startGuildRaid();
    if (!r.ok) log('⚠️ Рейд недоступен: мало очков или идёт кулдаун.', 'warn');
    render();
  });
  panel.querySelector('[data-guild="upgrade"]').addEventListener('click', () => {
    const r = upgradeGuild();
    if (!r.ok) log('⚠️ Недостаточно казны гильдии для апгрейда.', 'warn');
    render();
  });

  root.appendChild(panel);
}

function renderProfileTab(root) {
  const panel = document.createElement('section');
  panel.className = 'panel';

  const activeMechanics = state.globalMechanics.filter((m) => m.active).length;

  panel.innerHTML = `
    <h2>👤 Профиль и метрики</h2>
    <div class="stats">
      <div class="stat"><span>Уровень мастера</span><strong>${state.level}</strong></div>
      <div class="stat"><span>Рейтинг</span><strong>${state.rating.toFixed(2)}</strong></div>
      <div class="stat"><span>Репутация</span><strong>${format(state.reputation)}</strong></div>
      <div class="stat"><span>Износ инструмента</span><strong>${Math.round(state.toolWear)}%</strong></div>
      <div class="stat"><span>Доллары</span><strong>${format(state.dollars)} $</strong></div>
      <div class="stat"><span>Выполнено заказов</span><strong>${format(state.totals.done)}</strong></div>
      <div class="stat"><span>Провалов</span><strong>${format(state.totals.failed)}</strong></div>
      <div class="stat"><span>Средний доход</span><strong>${state.totals.done ? `${format(state.totals.netIncomeTotal / state.totals.done)} ₽` : '0 ₽'}</strong></div>
      <div class="stat"><span>Глобальные механики</span><strong>${activeMechanics} / 125</strong></div>
      <div class="stat"><span>Бонус к деньгам/тик</span><strong>${format(state.globalModifiers.moneyTickBonus)} ₽</strong></div>
    </div>
  `;

  root.appendChild(panel);
}

function renderAdminTab(root) {
  const panel = document.createElement('section');
  panel.className = 'panel';

  const activeMechanics = state.globalMechanics.filter((m) => m.active).length;

  panel.innerHTML = `
    <h2>🛠 Админ-панель</h2>
    <p class="hint">Тестовые инструменты для баланса и отладки.</p>
    <div class="company">Активных глобальных механик: <b>${activeMechanics}/125</b></div>
    <div class="menu-list">
      <button data-admin="money">+ 10 000 ₽</button>
      <button data-admin="dollars">+ 100 $</button>
      <button data-admin="rep">+ 100 репутации</button>
      <button data-admin="rating">Сбросить рейтинг до 5.0</button>
      <button data-admin="wear">Сбросить износ инструмента</button>
      <button data-admin="orders">Очистить очередь заказов</button>
      <button data-admin="mechanics">Активировать все 125 механик</button>
    </div>
  `;

  panel.querySelectorAll('[data-admin]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.admin;
      if (action === 'money') state.money += 10000;
      if (action === 'dollars') state.dollars += 100;
      if (action === 'rep') state.reputation += 100;
      if (action === 'rating') state.rating = 5;
      if (action === 'wear') state.toolWear = 0;
      if (action === 'orders') state.orders = [];
      if (action === 'mechanics') state.globalMechanics.forEach((m) => { m.active = true; });

      log(`🧪 Админ-действие: ${action}`, 'warn');
      render();
    });
  });

  root.appendChild(panel);
}

function makeInDevelopmentPanel(text) {
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.innerHTML = `<h2>🚧 В разработке</h2><p class="hint">${text}</p>`;
  return panel;
}

function renderStats() {
  document.getElementById('money').textContent = `${format(state.money)} ₽`;
  document.getElementById('dollars').textContent = `${format(state.dollars)} $`;
  document.getElementById('level').textContent = `${state.level}`;
}
