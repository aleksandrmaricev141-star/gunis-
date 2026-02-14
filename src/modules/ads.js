import { orderTemplates, state } from './state.js';
import { clamp, random, format } from './utils.js';
import { log } from '../ui/logger.js';

export function maybeUnlockChannels() {
  state.adChannels.forEach((channel) => {
    if (!channel.unlocked && state.reputation >= (channel.unlockRep || 99999)) {
      channel.unlocked = true;
      log(`🔓 Открыт канал: <b>${channel.name}</b>`, 'ok');
    }
  });
}

export function setChannelBudget(channelId, delta) {
  const channel = state.adChannels.find((item) => item.id === channelId);
  if (!channel) return;
  channel.budget = clamp(channel.budget + delta, 1, 5);
}

function spawnLead(channel) {
  const finalLeadCost = Math.round(channel.costPerLead * (1 + (channel.budget - 1) * 0.24));
  state.money -= finalLeadCost;

  const fakeRisk = clamp(channel.fakeRisk - state.company.adLevel * 0.01, 0.02, 0.5);
  if (Math.random() < fakeRisk) {
    log(`⚠️ Фейковая заявка: ${channel.name}. Потеря ${format(finalLeadCost)}₽`, 'warn');
    return;
  }

  const conversionBoost = 0.03 * (channel.budget - 1) + 0.02 * (state.company.adLevel - 1);
  const finalConversion = clamp(channel.conversion + conversionBoost, 0.15, 0.97);
  if (Math.random() > finalConversion) {
    log(`📭 Лид из ${channel.name} не конвертировался.`, 'warn');
    return;
  }

  const template = orderTemplates[Math.floor(Math.random() * orderTemplates.length)];
  const base = random(template.min, template.max);
  const qualityBonus = 1 + channel.quality * 0.22;
  const difficulty = random(0.9, 1.2);

  const durationBase = random(template.duration[0], template.duration[1]);
  const logisticsSpeed = state.company.logisticsLevel > 1 ? 1 - (state.company.logisticsLevel - 1) * 0.04 : 1;
  const duration = Math.max(6, Math.round(durationBase * (1.05 - 0.05 * state.personalSkill.speed) * logisticsSpeed));

  state.orders.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: template.type,
    price: Math.round(base * qualityBonus * (1 + 0.05 * state.personalSkill.negotiation)),
    duration,
    progress: 0,
    baseRisk: clamp(template.baseRisk * difficulty, 0.04, 0.45),
    repReward: Math.round(template.rep * difficulty),
    adCost: finalLeadCost,
  });
}

export function processAdChannelsTick() {
  const ownOrdersPenalty = state.company.inCompany ? 0.6 : 1; // после вступления в компанию своих заказов меньше

  state.adChannels.forEach((channel) => {
    if (!channel.active) return;

    const finalLeadCost = Math.round(channel.costPerLead * (1 + (channel.budget - 1) * 0.24));
    if (state.money < finalLeadCost) {
      channel.active = false;
      log(`⛔ Канал ${channel.name} остановлен: не хватает денег на лид.`, 'bad');
      return;
    }

    const baseChance = 0.2 + channel.conversion * 0.25;
    const adDepartmentBoost = state.company.inCompany ? (state.company.adLevel - 1) * 0.03 : 0;
    const spawnChance = clamp((baseChance + adDepartmentBoost) * ownOrdersPenalty, 0.05, 0.9);

    if (Math.random() < spawnChance) {
      spawnLead(channel);
    }
  });
}
