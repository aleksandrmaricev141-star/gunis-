import { events } from '../config/gameData.js';

const EVENT_DURATION_MS = 90000;

export function rotateEventIfNeeded(state) {
  const now = Date.now();
  if (now - state.currentEvent.startedAt >= EVENT_DURATION_MS) {
    state.currentEvent.index = (state.currentEvent.index + 1) % events.length;
    state.currentEvent.startedAt = now;
  }
}

export function renderEvent(state) {
  const evt = events[state.currentEvent.index];
  const leftSec = Math.max(0, Math.ceil((EVENT_DURATION_MS - (Date.now() - state.currentEvent.startedAt)) / 1000));
  document.getElementById('eventName').textContent = `Событие: ${evt.name}`;
  document.getElementById('eventDesc').textContent = evt.desc;
  document.getElementById('eventTimer').textContent = `До смены: ${leftSec} сек.`;
}

export { events };
