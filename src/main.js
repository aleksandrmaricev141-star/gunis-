import { state } from './modules/state.js';
import { processAdChannelsTick, maybeUnlockChannels } from './modules/ads.js';
import { autoRepairTool, processOrdersTick } from './modules/orders.js';
import { processCompanyTick, updateCompanyProgress } from './modules/company.js';
import { initNavigation, render } from './ui/render.js';
import { log } from './ui/logger.js';

function gameTick() {
  processAdChannelsTick();
  processOrdersTick();
  autoRepairTool();
  processCompanyTick();

  maybeUnlockChannels();
  updateCompanyProgress();

  state.level = 1 + Math.floor(state.reputation / 80);
  render();
}

function bootstrap() {
  initNavigation();
  render();
  log('🎮 Игра началась. Без рекламы заказов нет!');
  setInterval(gameTick, 1000);
}

bootstrap();
