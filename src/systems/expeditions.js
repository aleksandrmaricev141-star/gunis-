import { expeditions } from '../config/gameData.js';

export function renderExpeditions(state, refresh) {
  const list = document.getElementById('expeditionsList');
  list.innerHTML = '';
  const now = Date.now();

  expeditions.forEach((exp) => {
    const li = document.createElement('li');
    li.className = 'item';
    const run = state.expeditionRuns[exp.id];
    li.innerHTML = `<strong>${exp.name}</strong><br><span class="hint">${exp.duration}с | Награда ${exp.rewardEnergy}⚡ ${exp.rewardCrystals}💎 ${exp.rewardXp}XP</span>`;

    const btn = document.createElement('button');
    btn.className = 'btn';

    if (!run) {
      btn.textContent = 'Отправить';
      btn.onclick = () => {
        state.expeditionRuns[exp.id] = { finishAt: now + exp.duration * 1000 };
        refresh();
      };
    } else if (run.finishAt > now) {
      btn.textContent = `В пути ${Math.ceil((run.finishAt - now) / 1000)}с`;
      btn.disabled = true;
    } else {
      btn.textContent = 'Забрать награду';
      btn.onclick = () => {
        state.energy += exp.rewardEnergy;
        state.totalEarned += exp.rewardEnergy;
        state.crystals += exp.rewardCrystals;
        state.xp += exp.rewardXp;
        delete state.expeditionRuns[exp.id];
        refresh();
      };
    }

    li.appendChild(btn);
    list.appendChild(li);
  });
}
