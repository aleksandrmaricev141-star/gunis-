import { rankByRep, state } from './state.js';
import { log } from '../ui/logger.js';

export function createCompany(name = 'Моя компания') {
  if (state.company.inCompany) return { ok: false, reason: 'already' };
  if (state.dollars < 500) return { ok: false, reason: 'no_dollars' };

  state.dollars -= 500;
  state.company.inCompany = true;
  state.company.name = name;
  state.company.rank = 'Директор';
  state.company.cut = 0;
  state.company.members = 2;
  log(`🏢 Компания «${name}» создана за 500$`, 'ok');
  return { ok: true };
}

export function updateCompanyProgress() {
  if (!state.company.inCompany) return;

  // Если ты владелец компании, ранги не применяются.
  if (state.company.rank === 'Директор' && state.company.cut === 0) return;

  let activeRank = rankByRep[0];
  for (const rank of rankByRep) {
    if (state.reputation >= rank.rep) activeRank = rank;
  }

  const prev = state.company.rank;
  state.company.rank = activeRank.rank;
  state.company.cut = activeRank.cut;

  if (prev !== activeRank.rank) {
    log(`🏆 Повышение в компании: <b>${activeRank.rank}</b>`, 'ok');
  }
}

export function processCompanyTick() {
  if (!state.company.inCompany) return;

  const memberBonus = state.company.members * (3 + state.company.hrLevel);
  const logisticsBonus = state.company.logisticsLevel * 6;
  const warehouseBonus = state.company.warehouseLevel * 4;
  const passive = memberBonus + logisticsBonus + warehouseBonus;

  state.company.passiveIncome = passive;
  state.money += passive;
}

export function upgradeCompany(branch) {
  if (!state.company.inCompany) return { ok: false, reason: 'no_company' };

  const configs = {
    adLevel: { cost: 220, label: 'Реклама компании' },
    logisticsLevel: { cost: 260, label: 'Логистика' },
    hrLevel: { cost: 300, label: 'HR-отдел' },
    warehouseLevel: { cost: 240, label: 'Склад и инструмент' },
  };

  const cfg = configs[branch];
  if (!cfg) return { ok: false, reason: 'unknown' };

  const current = state.company[branch];
  const cost = cfg.cost * current;
  if (state.money < cost) return { ok: false, reason: 'no_money' };

  state.money -= cost;
  state.company[branch] += 1;

  if (branch === 'hrLevel') state.company.members += 1;

  log(`⬆️ Улучшено: ${cfg.label} (ур. ${state.company[branch]}) за ${cost}₽`, 'ok');
  return { ok: true };
}
