export function log(message, cls = '') {
  const logEl = document.getElementById('log');
  const row = document.createElement('div');
  row.className = `log-entry ${cls}`;
  row.innerHTML = message;
  logEl.prepend(row);
}
