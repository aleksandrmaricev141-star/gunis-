import { createDailyTasks, todayKey } from '../core/state.js';

export function syncDaily(state) {
  if (state.dailyKey !== todayKey()) {
    state.dailyKey = todayKey();
    state.dailyTasks = createDailyTasks(state.dailyKey);
  }
}

export function trackDaily(state, type, amount) {
  state.dailyTasks.forEach((t) => {
    if (t.done) return;
    if (t.type !== type) return;
    t.progress = Math.min(t.target, t.progress + amount);
    if (t.progress >= t.target) {
      t.done = true;
      state.energy += t.rewardEnergy;
      state.crystals += t.rewardCrystals;
      state.totalEarned += t.rewardEnergy;
    }
  });
}

export function renderDaily(state) {
  document.getElementById('dailyReset').textContent = `Сброс: ${state.dailyKey} + 1 день`;
  const list = document.getElementById('dailyList');
  list.innerHTML = '';

  state.dailyTasks.forEach((t) => {
    const li = document.createElement('li');
    li.className = `item ${t.done ? 'done' : ''}`;
    li.textContent = `${t.text} — ${t.progress}/${t.target} | +${t.rewardEnergy}⚡ +${t.rewardCrystals}💎`;
    list.appendChild(li);
  });
}
