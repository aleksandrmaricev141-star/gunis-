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

function spawnLead(channel) {
  state.money -= channel.costPerLead;

  if (Math.random() < channel.fakeRisk) {
    log(`⚠️ Фейковая заявка: ${channel.name}. Потеря ${format(channel.costPerLead)}₽`, 'warn');
    return;
  }

  if (Math.random() > channel.conversion) {
    log(`📭 Заявка ${channel.name} не конвертировалась.`, 'warn');
    return;
  }

  const template = orderTemplates[Math.floor(Math.random() * orderTemplates.length)];
  const base = random(template.min, template.max);
  const difficulty = random(0.9, 1.2);
  const duration = Math.round(random(template.duration[0], template.duration[1]) * (1.05 - 0.05 * state.personalSkill.speed));

  state.orders.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: template.type,
    price: Math.round(base * (1 + 0.05 * state.personalSkill.negotiation)),
    duration,
    progress: 0,
    baseRisk: clamp(template.baseRisk * difficulty, 0.04, 0.45),
    repReward: Math.round(template.rep * difficulty),
    adCost: channel.costPerLead,
  });
}

export function processAdChannelsTick() {
  state.adChannels.forEach((channel) => {
    if (!channel.active) return;

    if (state.money < channel.costPerLead) {
      channel.active = false;
      log(`⛔ Канал ${channel.name} остановлен: не хватает денег на лид.`, 'bad');
      return;
    }

    const spawnChance = 0.3 + channel.conversion * 0.2;
    if (Math.random() < spawnChance) spawnLead(channel);
  });
}
