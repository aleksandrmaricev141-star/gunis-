import { abilities } from '../config/gameData.js';

export function cleanupEffects(state) {
  const now = Date.now();
  Object.entries(state.activeEffects).forEach(([id, value]) => {
    if (value.until <= now) delete state.activeEffects[id];
  });
}

export function renderAbilities(state, refresh) {
  const list = document.getElementById('abilitiesList');
  list.innerHTML = '';
  const now = Date.now();

  abilities.forEach((ab) => {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `<strong>${ab.name}</strong><br><span class="hint">${ab.desc}</span>`;

    const nextReady = state.abilityCooldowns[ab.id] || 0;
    const onCd = nextReady > now;
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = onCd ? `Откат ${Math.ceil((nextReady - now) / 1000)}с` : 'Активировать';
    btn.disabled = onCd;

    if (!onCd) {
      btn.onclick = () => {
        state.activeEffects[ab.id] = {
          type: ab.type,
          value: ab.value,
          until: Date.now() + ab.duration * 1000
        };
        state.abilityCooldowns[ab.id] = Date.now() + ab.cooldown * 1000;
        refresh();
      };
    }

    li.appendChild(btn);
    list.appendChild(li);
  });
}
