export const state = {
  money: 700,
  rating: 5,
  reputation: 0,
  level: 1,
  toolWear: 0,
  personalSkill: { speed: 1, quality: 1, negotiation: 1 },
  adChannels: [
    { id: 'boards', name: '📱 Онлайн-доски', launchCost: 120, costPerLead: 45, conversion: 0.6, fakeRisk: 0.28, unlocked: true, active: false },
    { id: 'flyers', name: '📄 Листовки', launchCost: 80, costPerLead: 55, conversion: 0.4, fakeRisk: 0.2, unlocked: true, active: false },
    { id: 'site', name: '🌐 Сайт-визитка', launchCost: 260, costPerLead: 35, conversion: 0.68, fakeRisk: 0.1, unlocked: true, active: false },
    { id: 'callCenter', name: '📞 Колл-центр', launchCost: 560, costPerLead: 80, conversion: 0.82, fakeRisk: 0.14, unlocked: false, active: false, unlockRep: 150 },
    { id: 'context', name: '📊 Контекстная реклама', launchCost: 750, costPerLead: 120, conversion: 0.9, fakeRisk: 0.09, unlocked: false, active: false, unlockRep: 250 },
  ],
  orders: [],
  activeOrders: [],
  totals: { done: 0, failed: 0, netIncomeTotal: 0 },
  company: { inCompany: false, name: null, rank: 'Одиночка', cut: 0 },
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
