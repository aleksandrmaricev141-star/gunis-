export function random(min, max) {
  return Math.random() * (max - min) + min;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function format(n) {
  return Math.round(n).toLocaleString('ru-RU');
}
