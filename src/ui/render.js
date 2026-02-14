import { state } from '../modules/state.js';
import { format } from '../modules/utils.js';
import { rejectOrder, takeOrder } from '../modules/orders.js';
import { createCompany, upgradeCompany } from '../modules/company.js';
import { setChannelBudget } from '../modules/ads.js';

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
      <button class="menu-item ghost" data-open="metrics">📊 Метрики</button>
      <button class="menu-item ghost" data-open="log">📝 Лог</button>
    </div>
    <p class="hint">Нажатие открывает отдельное окно раздела.</p>
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
  header.innerHTML = `<b>${titleByType(type)}</b>`;

  const close = document.createElement('button');
  close.textContent = '✖';
  close.className = 'secondary';
  close.onclick = () => overlay.remove();
  header.appendChild(close);

  const body = document.createElement('div');
  body.className = 'modal-body';
  if (type === 'ads') body.appendChild(renderAdsPanel());
  if (type === 'orders') body.appendChild(renderOrdersPanel());
  if (type === 'metrics') body.appendChild(renderMetricsPanel());
  if (type === 'log') body.appendChild(renderLogPanel());

  modal.append(header, body);
  overlay.appendChild(modal);
  document.querySelector('.game-frame').appendChild(overlay);
}

function titleByType(type) {
  const map = {
    ads: '📢 Реклама',
    orders: '🧾 Заказы',
    metrics: '📊 Метрики',
    log: '📝 Лог',
  };
  return map[type] || 'Раздел';
}

function renderAdsPanel() {
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.innerHTML = '<p class="hint">Сложная реклама: бюджет канала влияет на цену лида и конверсию.</p>';

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

function renderMetricsPanel() {
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.innerHTML = `
    <div class="stats mini">
      <div class="stat"><span>Заказов выполнено</span><strong>${format(state.totals.done)}</strong></div>
      <div class="stat"><span>Провалы</span><strong>${format(state.totals.failed)}</strong></div>
      <div class="stat"><span>Средний доход</span><strong>${state.totals.done ? `${format(state.totals.netIncomeTotal / state.totals.done)} ₽` : '0 ₽'}</strong></div>
      <div class="stat"><span>Доход компании/тик</span><strong>${format(state.company.passiveIncome)} ₽</strong></div>
    </div>
  `;
  return panel;
}

function renderLogPanel() {
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.innerHTML = '<div id="logMirror" class="log"></div>';
  panel.querySelector('#logMirror').innerHTML = document.getElementById('log')?.innerHTML || '<div class="log-entry">Лог пуст.</div>';
  return panel;
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
      createCompany('MasterRush Service');
      render();
    });
    root.appendChild(panel);
    return;
  }

  panel.innerHTML = `
    <h2>🏢 ${state.company.name}</h2>
    <div class="company">
      <div>Должность: <span class="badge">${state.company.rank}</span></div>
      <div>Сотрудники: <b>${state.company.members}</b></div>
      <div>Пассивный доход: <b>${format(state.company.passiveIncome)} ₽/тик</b></div>
      <div>Реклама компании ур.: <b>${state.company.adLevel}</b></div>
      <div>Логистика ур.: <b>${state.company.logisticsLevel}</b></div>
      <div>HR ур.: <b>${state.company.hrLevel}</b></div>
      <div>Склад ур.: <b>${state.company.warehouseLevel}</b></div>
    </div>
    <div class="menu-list">
      <button data-up="adLevel">⬆️ Реклама компании</button>
      <button data-up="logisticsLevel">⬆️ Логистика</button>
      <button data-up="hrLevel">⬆️ Найм (HR)</button>
      <button data-up="warehouseLevel">⬆️ Склад и инструменты</button>
    </div>
  `;

  panel.querySelectorAll('[data-up]').forEach((btn) => {
    btn.addEventListener('click', () => {
      upgradeCompany(btn.dataset.up);
      render();
    });
  });

  root.appendChild(panel);
}

function renderProfileTab(root) {
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.innerHTML = `
    <h2>👤 Профиль</h2>
    <div class="company">
      <div>Уровень мастера: <b>${state.level}</b></div>
      <div>Рейтинг: <b>${state.rating.toFixed(2)}</b></div>
      <div>Репутация: <b>${format(state.reputation)}</b></div>
      <div>Износ инструмента: <b>${Math.round(state.toolWear)}%</b></div>
      <div>Доллары: <b>${format(state.dollars)} $</b></div>
    </div>
  `;
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
  document.getElementById('rating').textContent = state.rating.toFixed(2);
  document.getElementById('reputation').textContent = format(state.reputation);
  document.getElementById('level').textContent = state.level;

  const dollarsEl = document.getElementById('dollars');
  if (dollarsEl) dollarsEl.textContent = `${format(state.dollars)} $`;
}
