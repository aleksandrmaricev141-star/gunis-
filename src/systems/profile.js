import { levelFromXp } from '../core/economy.js';

export function renderProfile(state) {
  const lvl = levelFromXp(state.xp);
  const nextLevelXp = lvl * lvl * 120;
  document.getElementById('profileSummary').textContent = `Игрок: ${state.playerName} | ID: ${state.playerId.slice(0, 8)} | Уровень ${lvl} | До след. уровня: ${Math.max(0, nextLevelXp - state.xp)} XP`;
}
