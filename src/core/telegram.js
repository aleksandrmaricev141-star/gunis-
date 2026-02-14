export function initTelegramUI() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return { userName: 'Гость лаборатории', platform: 'web' };

  tg.ready();
  tg.expand();

  if (tg.themeParams?.bg_color) {
    document.body.style.background = tg.themeParams.bg_color;
  }

  const userName = tg.initDataUnsafe?.user?.first_name || 'Агент';
  return { userName, platform: tg.platform || 'telegram' };
}
