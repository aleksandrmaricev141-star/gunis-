import { upgrades } from '../config/gameData.js';
import { upgradeCost } from '../core/economy.js';

export function renderUpgrades(state, refresh) {
  const list = document.getElementById('upgradesList');
  list.innerHTML = '';

  upgrades.forEach((u) => {
    const li = document.createElement('li');
    li.className = 'item';
    const lvl = state.upgradeLevels[u.id] || 0;
    const cost = upgradeCost(state, u.id);
    li.innerHTML = `<strong>${u.name}</strong><br><span class="hint">Ур. ${lvl} | Цена ${cost}</span>`;
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Купить';
    btn.disabled = state.energy < cost;
    btn.onclick = () => {
      if (state.energy < cost) return;
      state.energy -= cost;
      state.upgradeLevels[u.id] += 1;
      state.totalUpgrades += 1;
      refresh({ type: 'upgrade', amount: 1 });
    };
    li.appendChild(btn);
    list.appendChild(li);
  });
}
