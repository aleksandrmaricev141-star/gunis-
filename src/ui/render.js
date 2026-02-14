import { perClick, passivePerSecond } from '../core/economy.js';
import { events } from '../systems/events.js';

export function renderCore(state) {
  document.getElementById('energy').textContent = Math.floor(state.energy);
  document.getElementById('crystals').textContent = state.crystals;
  document.getElementById('essence').textContent = state.essence;
  document.getElementById('perClick').textContent = perClick(state, events);
  document.getElementById('passive').textContent = passivePerSecond(state, events);
}
