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
  const globalBonus = state.globalModifiers.companyIncomeBonus;
  const guildIncome = Math.floor(state.company.guild.points * 0.03 + state.company.guild.level * 2);

  const passive = memberBonus + logisticsBonus + warehouseBonus + globalBonus + guildIncome;

  state.company.passiveIncome = passive;
  state.money += passive;

  processGuildTick();
}

function processGuildTick() {
  const guild = state.company.guild;
  guild.questProgress += state.company.members + state.company.logisticsLevel;

  if (guild.questProgress >= guild.questGoal) {
    guild.questProgress -= guild.questGoal;
    guild.points += 30;
    guild.treasury += 120;
    state.money += 250;
    log('🛡 Гильдейский контракт выполнен: +очки гильдии, +казна, +деньги.', 'ok');
  }

  if (guild.raidCooldown > 0) guild.raidCooldown -= 1;
}

export function donateToGuild(amount = 100) {
  if (!state.company.inCompany) return { ok: false, reason: 'no_company' };
  if (state.money < amount) return { ok: false, reason: 'no_money' };

  state.money -= amount;
  state.company.guild.treasury += amount;
  state.company.guild.points += Math.floor(amount / 20);
  log(`🤝 Донат в гильдию: ${amount}₽`, 'ok');
  return { ok: true };
}

export function startGuildRaid() {
  if (!state.company.inCompany) return { ok: false, reason: 'no_company' };
  const guild = state.company.guild;

  if (guild.raidCooldown > 0) return { ok: false, reason: 'cooldown' };
  if (guild.points < 80) return { ok: false, reason: 'no_points' };

  guild.points -= 80;
  guild.raidCooldown = 45;

  const successChance = 0.45 + state.company.logisticsLevel * 0.05 + state.company.adLevel * 0.03;
  if (Math.random() < successChance) {
    const reward = 600 + guild.level * 120;
    state.money += reward;
    guild.treasury += Math.floor(reward * 0.2);
    log(`⚔️ Гильдейский рейд успешен! Награда ${reward}₽`, 'ok');
    return { ok: true };
  }

  log('⚠️ Гильдейский рейд провален. Попробуйте позже.', 'warn');
  return { ok: true };
}

export function upgradeGuild() {
  if (!state.company.inCompany) return { ok: false, reason: 'no_company' };
  const guild = state.company.guild;
  const need = guild.level * 260;

  if (guild.treasury < need) return { ok: false, reason: 'no_treasury' };
  guild.treasury -= need;
  guild.level += 1;
  guild.members += 1;
  guild.questGoal += 45;
  log(`🏰 Гильдия улучшена до уровня ${guild.level}`, 'ok');
  return { ok: true };
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
  if (branch === 'logisticsLevel') state.company.guild.logisticsRoute += 1;

  log(`⬆️ Улучшено: ${cfg.label} (ур. ${state.company[branch]}) за ${cost}₽`, 'ok');
  return { ok: true };
}
