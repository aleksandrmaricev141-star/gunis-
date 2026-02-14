export const STORAGE_KEY = 'neon-syndicate-v3';

export const upgrades = [
  { id: 'core', name: 'Квантовое ядро', baseCost: 25, click: 1, passive: 0 },
  { id: 'drone', name: 'Сборщик-дрон', baseCost: 80, click: 0, passive: 1 },
  { id: 'reactor', name: 'Плазменный реактор', baseCost: 170, click: 2, passive: 1 }
];

export const skins = [
  { id: 'base', name: 'Базовый инженер', cost: 0, multiplier: 1 },
  { id: 'cyber', name: 'Cyber Nomad', cost: 80, multiplier: 1.25 },
  { id: 'oracle', name: 'Neon Oracle', cost: 180, multiplier: 1.5 }
];

export const storyChapters = [
  {
    id: 'ch1',
    title: 'Глава 1: Пробуждение станции',
    tasks: [
      { text: 'Накопи 300 энергии', done: (s) => s.energy >= 300 },
      { text: 'Купи 3 уровня улучшений', done: (s) => Object.values(s.upgradeLevels).reduce((a, b) => a + b, 0) >= 3 }
    ],
    artifact: { name: 'Ядро Инициации', desc: '+1 за клик', clickBonus: 1, passiveBonus: 0 }
  },
  {
    id: 'ch2',
    title: 'Глава 2: Тёмный протокол',
    tasks: [
      { text: 'Разблокируй скин Cyber Nomad', done: (s) => s.unlockedSkins.includes('cyber') },
      { text: 'Достигни 1500 рейтинга', done: (s) => s.lastRating >= 1500 }
    ],
    artifact: { name: 'Сфера Резонанса', desc: '+3 пассив/сек', clickBonus: 0, passiveBonus: 3 }
  }
];

export const dailyTemplates = [
  { id: 'clicks', text: 'Сделай 40 кликов', target: 40, rewardEnergy: 200, rewardCrystals: 10 },
  { id: 'upgrade', text: 'Купи 2 улучшения', target: 2, rewardEnergy: 250, rewardCrystals: 15 },
  { id: 'earn', text: 'Заработай 800 энергии', target: 800, rewardEnergy: 300, rewardCrystals: 20 }
];

export const achievements = [
  { id: 'a1', text: 'Первый шаг: 100 энергии', check: (s) => s.totalEarned >= 100, rewardCrystals: 10 },
  { id: 'a2', text: 'Инженер: 10 улучшений', check: (s) => s.totalUpgrades >= 10, rewardCrystals: 25 },
  { id: 'a3', text: 'Легенда: 1 артефакт', check: (s) => s.artifacts.length >= 1, rewardCrystals: 40 }
];

export const abilities = [
  { id: 'burst', name: 'Перегрузка', desc: 'x2 к клику на 20 сек', cooldown: 60, duration: 20, type: 'clickBoost', value: 2 },
  { id: 'overclock', name: 'Оверклок', desc: '+8 пассив/сек на 20 сек', cooldown: 75, duration: 20, type: 'passiveBoost', value: 8 }
];

export const events = [
  { name: 'Электрошторм', desc: '+40% к клику', clickMult: 1.4, passiveMult: 1 },
  { name: 'Тихий цикл', desc: '+50% к пассиву', clickMult: 1, passiveMult: 1.5 },
  { name: 'Стабильная сеть', desc: '+10% ко всему', clickMult: 1.1, passiveMult: 1.1 }
];

export const expeditions = [
  { id: 'short', name: 'Короткий рейд', duration: 45, rewardEnergy: 180, rewardCrystals: 8 },
  { id: 'deep', name: 'Глубокая вылазка', duration: 120, rewardEnergy: 700, rewardCrystals: 30 }
];

export const guilds = [
  { id: 'forge', name: 'Iron Forge', bonusClick: 1, bonusPassive: 0 },
  { id: 'pulse', name: 'Pulse Order', bonusClick: 0, bonusPassive: 2 },
  { id: 'veil', name: 'Shadow Veil', bonusClick: 1, bonusPassive: 1 }
];

export const guildQuestTemplates = [
  { id: 'gq_clicks', text: 'Вклад: 60 кликов', target: 60, type: 'clicks', rewardGuildXp: 120, rewardCrystals: 12 },
  { id: 'gq_earn', text: 'Вклад: 1200 энергии', target: 1200, type: 'earn', rewardGuildXp: 180, rewardCrystals: 15 }
];
