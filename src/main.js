import { ADMIN_CODE } from './config/gameData.js';
import { defaultState } from './core/state.js';
import { load, save } from './core/storage.js';
import { perClick, passivePerSecond } from './core/economy.js';
import { initTelegramUI } from './core/telegram.js';
import { renderCore } from './ui/render.js';
import { renderUpgrades } from './systems/upgrades.js';
import { renderSkins } from './systems/skins.js';
import { clearLeaderboards, renderRating, updateLeaderboards } from './systems/rating.js';
import { syncDaily, renderDaily, trackDaily } from './systems/daily.js';
import { renderStory } from './systems/story.js';
import { renderAchievements } from './systems/achievements.js';
import { cleanupEffects, renderAbilities } from './systems/abilities.js';
import { rotateEventIfNeeded, renderEvent, events } from './systems/events.js';
import { renderExpeditions } from './systems/expeditions.js';
import { doPrestige, renderPrestige } from './systems/prestige.js';
import { initTabs } from './systems/tabs.js';
import { buyGuildBuff, createGuild, donateToGuild, renderGuilds, trackGuild } from './systems/guilds.js';
import { renderProfile } from './systems/profile.js';

const state = load(defaultState());
const tg = initTelegramUI();
state.playerName = tg.userName || state.playerName;
document.getElementById('tgUserLabel').textContent = `${state.playerName}, платформа: ${tg.platform}`;
initTabs();

function applyIncome(amount, xpGain = 0) {
  if (amount > 0) {
    state.energy += amount;
    state.totalEarned += amount;
    trackDaily(state, 'earn', amount);
    trackGuild(state, 'earn', amount);
  }
  if (xpGain > 0) state.xp += xpGain;
}

function refresh(meta = {}) {
  syncDaily(state);
  cleanupEffects(state);
  rotateEventIfNeeded(state);

  if (meta.type === 'upgrade') trackDaily(state, 'upgrade', meta.amount || 1);

  renderCore(state);
  renderUpgrades(state, refresh);
  renderSkins(state, refresh);
  renderDaily(state);
  renderStory(state, refresh);
  renderAchievements(state, refresh);
  renderAbilities(state, refresh);
  renderEvent(state);
  renderExpeditions(state, refresh);
  renderPrestige(state);
  renderGuilds(state, refresh);
  renderProfile(state);

  updateLeaderboards(state);
  renderRating(state);

  document.getElementById('adminControls').classList.toggle('hidden', !state.isAdmin);
  save(state);
}

document.getElementById('tapButton').addEventListener('click', () => {
  const gain = perClick(state, events);
  applyIncome(gain, 1);
  state.clicks += 1;
  trackDaily(state, 'clicks', 1);
  trackGuild(state, 'clicks', 1);
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

document.getElementById('createGuildBtn').addEventListener('click', () => {
  const name = document.getElementById('newGuildName').value;
  const result = createGuild(state, name);
  if (!result.ok) alert(result.reason);
  document.getElementById('newGuildName').value = '';
  refresh();
});

document.getElementById('donateGuildBtn').addEventListener('click', () => {
  donateToGuild(state);
  refresh();
});

document.getElementById('buyGuildBuffBtn').addEventListener('click', () => {
  buyGuildBuff(state);
  refresh();
});

document.getElementById('adminLogin').addEventListener('click', () => {
  const code = document.getElementById('adminCode').value;
  if (code === ADMIN_CODE) {
    state.isAdmin = true;
    alert('Админ режим включен');
  }
  refresh();
});

document.getElementById('addEnergyBtn').addEventListener('click', () => {
  if (!state.isAdmin) return;
  state.energy += 1000;
  refresh();
});

document.getElementById('addCrystalsBtn').addEventListener('click', () => {
  if (!state.isAdmin) return;
  state.crystals += 200;
  refresh();
});

document.getElementById('clearRatingsBtn').addEventListener('click', () => {
  if (!state.isAdmin) return;
  clearLeaderboards(state);
  refresh();
});

setInterval(() => {
  const passive = passivePerSecond(state, events);
  applyIncome(passive, passive > 0 ? 1 : 0);
  refresh();
}, 1000);

refresh();
