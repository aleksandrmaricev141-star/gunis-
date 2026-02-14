
import { createGlobalMechanicsPool } from './globalMechanics.js';

export const state = {
  money: 700,
  dollars: 25,
  rating: 5,
  reputation: 0,
  level: 1,
  toolWear: 0,
  personalSkill: { speed: 1, quality: 1, negotiation: 1 },
  adChannels: [
    { id: 'boards', name: '📱 Онлайн-доски', launchCost: 120, costPerLead: 45, conversion: 0.6, fakeRisk: 0.28, quality: 0.45, unlocked: true, active: false, budget: 1 },
    { id: 'flyers', name: '📄 Листовки', launchCost: 80, costPerLead: 55, conversion: 0.4, fakeRisk: 0.2, quality: 0.35, unlocked: true, active: false, budget: 1 },
    { id: 'site', name: '🌐 Сайт-визитка', launchCost: 260, costPerLead: 35, conversion: 0.68, fakeRisk: 0.1, quality: 0.6, unlocked: true, active: false, budget: 1 },
    { id: 'callCenter', name: '📞 Колл-центр', launchCost: 560, costPerLead: 80, conversion: 0.82, fakeRisk: 0.14, quality: 0.72, unlocked: false, active: false, unlockRep: 150, budget: 1 },
    { id: 'context', name: '📊 Контекстная реклама', launchCost: 750, costPerLead: 120, conversion: 0.9, fakeRisk: 0.09, quality: 0.86, unlocked: false, active: false, unlockRep: 250, budget: 1 },
  ],
  orders: [],
  activeOrders: [],
  totals: { done: 0, failed: 0, netIncomeTotal: 0 },
  globalModifiers: {
    moneyTickBonus: 0,
    repTickBonus: 0,
    leadChanceBonus: 0,
    failureRiskReduction: 0,
    companyIncomeBonus: 0,
  },
  company: {
    inCompany: false,
    name: null,
    rank: 'Одиночка',
    cut: 0,
    members: 1,
    logisticsLevel: 1,
    adLevel: 1,
    hrLevel: 1,
    warehouseLevel: 1,
    passiveIncome: 0,
    guild: {
      level: 1,
      points: 0,
      treasury: 0,
      members: 3,
      questProgress: 0,
      questGoal: 120,
      raidCooldown: 0,
      logisticsRoute: 1,
    },
  },
  globalMechanics: createGlobalMechanicsPool(),
};

export const rankByRep = [
  { rep: 0, rank: 'Стажёр', cut: 0.4 },
  { rep: 120, rank: 'Мастер', cut: 0.28 },
  { rep: 280, rank: 'Старший мастер', cut: 0.18 },
  { rep: 520, rank: 'Зам. директора', cut: 0.12 },
  { rep: 900, rank: 'Директор', cut: 0.06 },
];

export const orderTemplates = [
  { type: 'Мелкий ремонт', min: 130, max: 280, duration: [10, 20], baseRisk: 0.08, rep: 9 },
  { type: 'Срочный заказ', min: 250, max: 520, duration: [8, 16], baseRisk: 0.18, rep: 14 },
  { type: 'Комплексная работа', min: 500, max: 980, duration: [18, 36], baseRisk: 0.25, rep: 24 },
  { type: 'Абонентский клиент', min: 320, max: 640, duration: [12, 24], baseRisk: 0.1, rep: 18 },
];
