import { defaultState } from '../core/state.js';
import { prestigeGain } from '../core/economy.js';

export function renderPrestige(state) {
  const gain = prestigeGain(state);
  document.getElementById('prestigeHint').textContent = `При перерождении получите +${gain} эссенции. Эссенция усиливает рейтинг.`;
  document.getElementById('prestigeButton').disabled = gain <= 0;
}

export function doPrestige(state) {
  const gain = prestigeGain(state);
  if (gain <= 0) return;
  const next = defaultState();
  next.essence = state.essence + gain;
  next.crystals = Math.floor(state.crystals * 0.25);
  Object.assign(state, next);
}
