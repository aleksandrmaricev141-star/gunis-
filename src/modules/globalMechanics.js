import { log } from '../ui/logger.js';

const categories = [
  'economy',
  'ads',
  'orders',
  'reputation',
  'company',
  'guild',
  'logistics',
  'tools',
  'market',
  'events',
];

const effects = [
  { key: 'moneyTickBonus', value: 1 },
  { key: 'leadChanceBonus', value: 0.0015 },
  { key: 'failureRiskReduction', value: 0.0007 },
  { key: 'repTickBonus', value: 0.04 },
  { key: 'companyIncomeBonus', value: 0.5 },
];

export function createGlobalMechanicsPool() {
  const list = [];
  for (let i = 1; i <= 125; i += 1) {
    const category = categories[i % categories.length];
    const effect = effects[i % effects.length];
    list.push({
      id: `gm-${i}`,
      name: `Глобальная механика #${i}`,
      category,
      unlockLevel: 1 + Math.floor(i / 7),
      effect: effect.key,
      value: effect.value,
      active: i <= 10,
      description: `Категория: ${category}. Эффект: ${effect.key} +${effect.value}`,
    });
  }
  return list;
}

export function unlockAvailableMechanics(state) {
  state.globalMechanics.forEach((mechanic) => {
    if (!mechanic.active && state.level >= mechanic.unlockLevel) {
      mechanic.active = true;
      log(`🌍 Открыта ${mechanic.name}`, 'ok');
    }
  });
}

export function applyGlobalMechanicsTick(state) {
  let moneyTickBonus = 0;
  let repTickBonus = 0;
  let leadChanceBonus = 0;
  let failureRiskReduction = 0;
  let companyIncomeBonus = 0;

  state.globalMechanics.forEach((mechanic) => {
    if (!mechanic.active) return;

    if (mechanic.effect === 'moneyTickBonus') moneyTickBonus += mechanic.value;
    if (mechanic.effect === 'repTickBonus') repTickBonus += mechanic.value;
    if (mechanic.effect === 'leadChanceBonus') leadChanceBonus += mechanic.value;
    if (mechanic.effect === 'failureRiskReduction') failureRiskReduction += mechanic.value;
    if (mechanic.effect === 'companyIncomeBonus') companyIncomeBonus += mechanic.value;
  });

  state.money += moneyTickBonus;
  state.reputation += repTickBonus;

  state.globalModifiers.moneyTickBonus = moneyTickBonus;
  state.globalModifiers.repTickBonus = repTickBonus;
  state.globalModifiers.leadChanceBonus = leadChanceBonus;
  state.globalModifiers.failureRiskReduction = failureRiskReduction;
  state.globalModifiers.companyIncomeBonus = companyIncomeBonus;
}
