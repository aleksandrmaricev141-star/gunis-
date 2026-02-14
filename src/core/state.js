import { dailyTemplates, upgrades } from '../config/gameData.js';

export const todayKey = () => new Date().toISOString().slice(0, 10);

export function createDailyTasks(key) {
  return dailyTemplates.map((d) => ({
    id: `${key}_${d.id}`,
    type: d.id,
    text: d.text,
    target: d.target,
    progress: 0,
    done: false,
    rewardEnergy: d.rewardEnergy,
    rewardCrystals: d.rewardCrystals
  }));
}

export function defaultState() {
  return {
    energy: 0,
    crystals: 0,
    essence: 0,
    totalEarned: 0,
    totalUpgrades: 0,
    clicks: 0,
    upgradeLevels: Object.fromEntries(upgrades.map((u) => [u.id, 0])),
    activeSkin: 'base',
    unlockedSkins: ['base'],
    artifacts: [],
    completedChapters: [],
    achievementClaimed: [],
    dailyKey: todayKey(),
    dailyTasks: createDailyTasks(todayKey()),
    activeEffects: {},
    abilityCooldowns: {},
    expeditionRuns: {},
    currentEvent: { index: 0, startedAt: Date.now() },
    lastRating: 0
  };
}
