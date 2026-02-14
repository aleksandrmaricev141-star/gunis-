import { achievements } from '../config/gameData.js';

export function renderAchievements(state, refresh) {
  const list = document.getElementById('achievementsList');
  list.innerHTML = '';

  achievements.forEach((a) => {
    const li = document.createElement('li');
    li.className = 'item';
    const ready = a.check(state);
    const claimed = state.achievementClaimed.includes(a.id);

    li.innerHTML = `<strong>${a.text}</strong><br><span class="hint">Награда: ${a.rewardCrystals} кристаллов</span>`;
    const btn = document.createElement('button');
    btn.className = 'btn';

    if (claimed) {
      btn.textContent = 'Получено';
      btn.disabled = true;
    } else if (ready) {
      btn.textContent = 'Забрать';
      btn.onclick = () => {
        state.achievementClaimed.push(a.id);
        state.crystals += a.rewardCrystals;
        refresh();
      };
    } else {
      btn.textContent = 'В процессе';
      btn.disabled = true;
    }

    li.appendChild(btn);
    list.appendChild(li);
  });
}
