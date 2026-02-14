import { state } from './state.js';
import { clamp, format, random } from './utils.js';
import { log } from '../ui/logger.js';

export function takeOrder(id) {
  const index = state.orders.findIndex((order) => order.id === id);
  if (index === -1) return;

  if (state.activeOrders.length >= 2) {
    log('⛔ Максимум 2 активных заказа одновременно.', 'warn');
    return;
  }

  const order = state.orders.splice(index, 1)[0];
  state.activeOrders.push(order);
  log(`🛠 Принят заказ: <b>${order.type}</b> за ${format(order.price)}₽`);
}

export function rejectOrder(id) {
  const index = state.orders.findIndex((order) => order.id === id);
  if (index === -1) return;

  state.orders.splice(index, 1);
  state.reputation = Math.max(0, state.reputation - 2);
  log('❌ Заказ отклонён, репутация -2.', 'bad');
}

export function processOrdersTick() {
  state.activeOrders.forEach((order) => {
    order.progress += 1;
  });

  const completed = state.activeOrders.filter((order) => order.progress >= order.duration);
  state.activeOrders = state.activeOrders.filter((order) => order.progress < order.duration);

  completed.forEach((order) => finalizeOrder(order));
}

function finalizeOrder(order) {
  const companyCut = state.company.inCompany ? order.price * state.company.cut : 0;
  const toolWearCost = 10 + 5 * (1.2 - state.personalSkill.quality);
  const tax = order.price * (state.company.inCompany ? 0.04 : 0.08);

  const failureRisk = clamp(
    order.baseRisk - 0.03 * state.personalSkill.quality + 0.01 * (state.toolWear / 100),
    0.03,
    0.6,
  );

  let penalties = 0;
  let success = true;

  if (Math.random() < failureRisk) {
    success = false;
    penalties = random(60, 260);
    state.rating = clamp(state.rating - 0.18, 1, 5);
    state.reputation = Math.max(0, state.reputation - 8);
    state.totals.failed += 1;
    log(`💥 Провал «${order.type}»: штраф ${format(penalties)}₽, рейтинг снижен.`, 'bad');
  }

  const netIncome = order.price - order.adCost - toolWearCost - companyCut - tax - penalties;
  state.money += netIncome;
  state.toolWear = clamp(state.toolWear + random(2, 6), 0, 100);
  state.totals.done += 1;
  state.totals.netIncomeTotal += netIncome;

  if (success) {
    state.rating = clamp(state.rating + 0.03, 1, 5);
    state.reputation += order.repReward;
    log(`✅ Заказ «${order.type}» завершён. Чистый доход: <b>${format(netIncome)}₽</b>.`, 'ok');
  }

  if (state.money < 0) {
    log('🚨 Баланс отрицательный: сократи рекламу или бери более маржинальные заказы.', 'bad');
  }
}

export function autoRepairTool() {
  if (state.toolWear < 35) return;

  const repairCost = Math.round(state.toolWear * 2.4);
  if (state.money < repairCost) return;

  state.money -= repairCost;
  state.toolWear = Math.max(0, state.toolWear - 45);
  log(`🧰 Инструмент обслужен за ${format(repairCost)}₽`, 'warn');
}
