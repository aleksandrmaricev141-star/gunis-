import { upgrades, skins } from '../config/gameData.js';

export function upgradeCost(state, upgradeId) {
  const upgrade = upgrades.find((u) => u.id === upgradeId);
  const lvl = state.upgradeLevels[upgradeId] || 0;
  return Math.floor(upgrade.baseCost * Math.pow(1.6, lvl));
}

export function artifactBonuses(state) {
  const click = state.artifacts.reduce((acc, a) => acc + (a.clickBonus || 0), 0);
  const passive = state.artifacts.reduce((acc, a) => acc + (a.passiveBonus || 0), 0);
  return { click, passive };
}

export function effectMultiplier(state, type) {
  const now = Date.now();
  let mult = 1;
  Object.values(state.activeEffects).forEach((effect) => {
    if (effect.until > now && effect.type === type) mult *= effect.value;
  });
  return mult;
}

export function eventMultiplier(state, events, type) {
  const evt = events[state.currentEvent.index] || events[0];
  return type === 'click' ? evt.clickMult : evt.passiveMult;
}

export function perClick(state, events) {
  const base = 1;
  const fromUpgrades = upgrades.reduce((acc, u) => acc + (state.upgradeLevels[u.id] || 0) * u.click, 0);
  const skinMult = skins.find((s) => s.id === state.activeSkin)?.multiplier || 1;
  const art = artifactBonuses(state);
  const val = (base + fromUpgrades + art.click) * skinMult * effectMultiplier(state, 'clickBoost') * eventMultiplier(state, events, 'click');
  return Math.floor(val);
}

export function passivePerSecond(state, events) {
  const fromUpgrades = upgrades.reduce((acc, u) => acc + (state.upgradeLevels[u.id] || 0) * u.passive, 0);
  const art = artifactBonuses(state);
  const val = (fromUpgrades + art.passive + (effectMultiplier(state, 'passiveBoost') - 1)) * eventMultiplier(state, events, 'passive');
  return Math.floor(val);
}

export function rating(state) {
  const upgradeScore = Object.values(state.upgradeLevels).reduce((a, b) => a + b, 0) * 20;
  return Math.floor(state.energy + state.crystals * 12 + state.artifacts.length * 300 + state.essence * 500 + upgradeScore);
}

export function prestigeGain(state) {
  return Math.floor(Math.sqrt(Math.max(0, state.totalEarned)) / 120);
}
