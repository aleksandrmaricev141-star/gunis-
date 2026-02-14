import { defaultState } from './core/state.js';
import { load, save, reset as resetStore } from './core/storage.js';
import { perClick, passivePerSecond } from './core/economy.js';
import { initTelegramUI } from './core/telegram.js';
import { renderCore } from './ui/render.js';
import { renderUpgrades } from './systems/upgrades.js';
import { renderSkins } from './systems/skins.js';
import { renderRating } from './systems/rating.js';
import { syncDaily, renderDaily, trackDaily } from './systems/daily.js';
import { renderStory } from './systems/story.js';
import { renderAchievements } from './systems/achievements.js';
import { cleanupEffects, renderAbilities } from './systems/abilities.js';
import { rotateEventIfNeeded, renderEvent, events } from './systems/events.js';
import { renderExpeditions } from './systems/expeditions.js';
import { doPrestige, renderPrestige } from './systems/prestige.js';
import { initTabs } from './systems/tabs.js';
import { renderGuilds, trackGuild } from './systems/guilds.js';

const state = load(defaultState());
const tg = initTelegramUI();
document.getElementById('tgUserLabel').textContent = `${tg.userName}, платформа: ${tg.platform}`;
initTabs();

function applyTickIncome(amount) {
  if (amount <= 0) return;
  state.energy += amount;
  state.totalEarned += amount;
  trackDaily(state, 'earn', amount);
  trackGuild(state, 'earn', amount);
}

function refresh(meta = {}) {
  syncDaily(state);
  cleanupEffects(state);
  rotateEventIfNeeded(state);

  if (meta.type === 'upgrade') {
    trackDaily(state, 'upgrade', meta.amount || 1);
  }

  renderCore(state);
  renderUpgrades(state, refresh);
  renderSkins(state, refresh);
  renderRating(state);
  renderDaily(state);
  renderStory(state, refresh);
  renderAchievements(state, refresh);
  renderAbilities(state, refresh);
  renderEvent(state);
  renderExpeditions(state, refresh);
  renderPrestige(state);
  renderGuilds(state, refresh);

  save(state);
}

document.getElementById('tapButton').addEventListener('click', () => {
  const gain = perClick(state, events);
  state.energy += gain;
  state.totalEarned += gain;
  state.clicks += 1;
  trackDaily(state, 'clicks', 1);
  trackDaily(state, 'earn', gain);
  trackGuild(state, 'clicks', 1);
  trackGuild(state, 'earn', gain);
  refresh();
});

document.getElementById('tradeButton').addEventListener('click', () => {
  if (state.energy < 250) return;
  state.energy -= 250;
  state.crystals += 15;
  refresh();
});

document.getElementById('prestigeButton').addEventListener('click', () => {
  doPrestige(state);
  refresh();
});

document.getElementById('resetButton').addEventListener('click', () => {
  resetStore();
  Object.assign(state, defaultState());
  refresh();
});

setInterval(() => {
  const passive = passivePerSecond(state, events);
  applyTickIncome(passive);
  refresh();
}, 1000);

refresh();
