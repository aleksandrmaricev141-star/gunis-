import { state } from '../modules/state.js';
import { format } from '../modules/utils.js';
import { rejectOrder, takeOrder } from '../modules/orders.js';

let currentTab = 'home';
let homeSection = 'overview';

export function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
      currentTab = button.dataset.tab;
      homeSection = 'overview';
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

  if (currentTab === 'home') {
    renderHome(root);
    return;
  }

  if (currentTab === 'company') {
    renderCompanyTab(root);
    return;
  }

  if (currentTab === 'profile') {
    renderProfileTab(root);
    return;
  }

  if (currentTab === 'corp-rating') {
    root.appendChild(makeInDevelopmentPanel('Рейтинг корпораций в разработке'));
    return;
  }

  if (currentTab === 'rating') {
    root.appendChild(makeInDevelopmentPanel('Глобальный рейтинг в разработке'));
  }
}

function renderHome(root) {
  const menuPanel = document.createElement('section');
  menuPanel.className = 'panel';
  menuPanel.innerHTML = `
    <h2>📂 Главное меню функций</h2>
    <div class="menu-list">
      <button class="menu-item ghost" data-home="overview">🏠 Главный экран</button>
      <button class="menu-item ghost" data-home="ads">📢 Реклама</button>
      <button class="menu-item ghost" data-home="orders">🧾 Заказы</button>
      <button class="menu-item ghost" data-home="metrics">📊 Метрики</button>
      <button class="menu-item ghost" data-home="log">📝 Лог</button>
    </div>
  `;

  menuPanel.querySelectorAll('[data-home]').forEach((btn) => {
    btn.addEventListener('click', () => {
      homeSection = btn.dataset.home;
      render();
    });
  });

  root.appendChild(menuPanel);

  if (homeSection === 'overview') {
    const panel = document.createElement('section');
    panel.className = 'panel';
    panel.innerHTML = '<h2>Добро пожаловать</h2><p class="hint">Выбери раздел в списке выше: например "Реклама", чтобы открыть все рекламные функции.</p>';
    root.appendChild(panel);
    return;
  }

  if (homeSection === 'ads') {
    root.appendChild(renderAdsPanel());
    return;
  }

  if (homeSection === 'orders') {
    root.appendChild(renderOrdersPanel());
    return;
  }

  if (homeSection === 'metrics') {
    root.appendChild(renderMetricsPanel());
    return;
  }

  if (homeSection === 'log') {
    root.appendChild(renderLogPanel());
  }
}

function renderAdsPanel() {
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.innerHTML = '<h2>📢 Реклама</h2><p class="hint">Без рекламы заказов нет. Оплата за каждый полученный лид.</p>';

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

    card.innerHTML = `
      <b>${channel.name}</b>
      <p>Запуск: ${format(channel.launchCost)}₽</p>
      <p>Цена лида: ${format(channel.costPerLead)}₽</p>
      <p>Конверсия: ${Math.round(channel.conversion * 100)}%</p>
      <p>Фейк-риск: ${Math.round(channel.fakeRisk * 100)}%</p>
    `;

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
  panel.innerHTML = '<h2>🧾 Заказы</h2>';

  const columns = document.createElement('div');
  columns.className = 'two-col';
  columns.innerHTML = `
    <div>
      <h3>Новые заявки</h3>
      <div id="orderList" class="list"></div>
    </div>
    <div>
      <h3>Активные работы</h3>
      <div id="activeList" class="list"></div>
    </div>
  `;

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
    <h2>📊 Метрики</h2>
    <div class="stats mini">
      <div class="stat"><span>Заказов выполнено</span><strong>${format(state.totals.done)}</strong></div>
      <div class="stat"><span>Провалы</span><strong>${format(state.totals.failed)}</strong></div>
      <div class="stat"><span>Средний доход</span><strong>${state.totals.done ? `${format(state.totals.netIncomeTotal / state.totals.done)} ₽` : '0 ₽'}</strong></div>
      <div class="stat"><span>Процент компании</span><strong>${Math.round(state.company.cut * 100)}%</strong></div>
    </div>
  `;
  return panel;
}

function renderLogPanel() {
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.innerHTML = '<h2>📝 Лог</h2><div id="logMirror" class="log"></div>';
  const mirror = panel.querySelector('#logMirror');
  const source = document.getElementById('log');
  mirror.innerHTML = source ? source.innerHTML : '<div class="log-entry">Лог пуст.</div>';
  return panel;
}

function renderCompanyTab(root) {
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.innerHTML = '<h2>🏢 Компания</h2><div class="company" id="companyInfo"></div>';

  const companyInfo = panel.querySelector('#companyInfo');
  if (!state.company.inCompany) {
    companyInfo.innerHTML = '<div>Статус: <span class="badge">Одиночка</span></div><div>Открытие компании: репутация 80+</div>';
  } else {
    companyInfo.innerHTML = `
      <div>Компания: <b>${state.company.name}</b></div>
      <div>Должность: <span class="badge">${state.company.rank}</span></div>
      <div>Процент компании: <b>${Math.round(state.company.cut * 100)}%</b></div>
    `;
  }

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
}
