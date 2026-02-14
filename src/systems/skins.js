import { skins } from '../config/gameData.js';

export function renderSkins(state, refresh) {
  const list = document.getElementById('skinsList');
  list.innerHTML = '';

  skins.forEach((skin) => {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `<strong>${skin.name}</strong><br><span class="hint">x${skin.multiplier} | Цена ${skin.cost} крист.</span>`;

    const btn = document.createElement('button');
    btn.className = 'btn';

    const unlocked = state.unlockedSkins.includes(skin.id);
    if (!unlocked) {
      btn.textContent = 'Разблокировать';
      btn.disabled = state.crystals < skin.cost;
      btn.onclick = () => {
        if (state.crystals < skin.cost) return;
        state.crystals -= skin.cost;
        state.unlockedSkins.push(skin.id);
        refresh();
      };
    } else if (state.activeSkin !== skin.id) {
      btn.textContent = 'Выбрать';
      btn.onclick = () => {
        state.activeSkin = skin.id;
        refresh();
      };
    } else {
      btn.textContent = 'Активен';
      btn.disabled = true;
    }

    li.appendChild(btn);
    list.appendChild(li);
  });
}
