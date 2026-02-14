import { levelFromXp, perClick, passivePerSecond } from '../core/economy.js';
import { events } from '../systems/events.js';

export function renderCore(state) {
  state.level = levelFromXp(state.xp);
  document.getElementById('energy').textContent = Math.floor(state.energy);
  document.getElementById('crystals').textContent = state.crystals;
  document.getElementById('playerLevel').textContent = state.level;
  document.getElementById('playerXp').textContent = state.xp;
  document.getElementById('perClick').textContent = perClick(state, events);
  document.getElementById('passive').textContent = passivePerSecond(state, events);
}
