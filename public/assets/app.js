const statusEl = document.getElementById('status');
const heroInfo = document.getElementById('hero-info');
const battleLog = document.getElementById('battle-log');
const inventoryInfo = document.getElementById('inventory-info');

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? '#ff8f8f' : '#9be58d';
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    ...options,
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Ошибка API');
  return data;
}

async function refreshHero() {
  try {
    const data = await api('/api/me');
    heroInfo.textContent = JSON.stringify(data.hero, null, 2);
  } catch {
    heroInfo.textContent = 'Не авторизован';
  }
}

async function refreshInventory() {
  try {
    const data = await api('/api/inventory');
    const lines = data.items.map(i => `#${i.id} ${i.item_name} [${i.slot_type}] atk:${i.attack_bonus} hp:${i.hp_bonus} arm:${i.armor_bonus} ${i.is_equipped ? '(экип.)' : ''}`);
    inventoryInfo.textContent = lines.join('\n') || 'Пусто';
  } catch (e) {
    inventoryInfo.textContent = e.message;
  }
}

document.getElementById('register-btn').onclick = async () => {
  try {
    await api('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        hero_name: document.getElementById('hero_name').value,
      }),
    });
    setStatus('Регистрация успешна. Теперь войдите.');
  } catch (e) { setStatus(e.message, true); }
};

document.getElementById('login-btn').onclick = async () => {
  try {
    await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
      }),
    });
    setStatus('Вход выполнен.');
    await refreshHero();
    await refreshInventory();
  } catch (e) { setStatus(e.message, true); }
};

document.getElementById('logout-btn').onclick = async () => {
  try {
    await api('/api/logout', {method: 'POST'});
    setStatus('Вы вышли.');
    await refreshHero();
  } catch (e) { setStatus(e.message, true); }
};

document.querySelectorAll('.upgrade').forEach(btn => {
  btn.onclick = async () => {
    try {
      await api('/api/training/upgrade', {
        method: 'POST',
        body: JSON.stringify({stat: btn.dataset.stat}),
      });
      setStatus('Параметр улучшен.');
      await refreshHero();
    } catch (e) { setStatus(e.message, true); }
  };
});

document.getElementById('fight-btn').onclick = async () => {
  try {
    const data = await api('/api/wild-field/fight', {method: 'POST', body: '{}'});
    battleLog.textContent = data.battle.combat_log.join('\n') + `\n\nНаграды: XP ${data.battle.xp_gain}, Бронза ${data.battle.bronze_gain}, Пыль ${data.battle.dust_gain}, Золото ${data.battle.gold_gain}`;
    setStatus('Бой завершен.');
    await refreshHero();
  } catch (e) { setStatus(e.message, true); }
};

document.getElementById('feed-amulet').onclick = async () => {
  try {
    await api('/api/amulet/feed', {
      method: 'POST',
      body: JSON.stringify({dust: Number(document.getElementById('dust').value)}),
    });
    setStatus('Оберег получил силу духов.');
    await refreshHero();
  } catch (e) { setStatus(e.message, true); }
};

document.getElementById('refresh-inventory').onclick = refreshInventory;

refreshHero();
refreshInventory();
