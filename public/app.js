const registerForm = document.getElementById('registerForm');
const registerMsg = document.getElementById('registerMsg');
const battleForm = document.getElementById('battleForm');
const battleResult = document.getElementById('battleResult');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerMsg.textContent = 'Создание героя...';

  const data = Object.fromEntries(new FormData(registerForm).entries());

  const res = await fetch('../backend/register.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  });

  const json = await res.json();
  registerMsg.textContent = json.error || json.message || 'Готово';
});

battleForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  battleResult.textContent = 'Симуляция...';

  const f = Object.fromEntries(new FormData(battleForm).entries());
  const payload = {
    attacker: {
      class: 'warrior',
      level: Number(f.a_level),
      stats: {
        strength: Number(f.a_strength),
        agility: Number(f.a_agility),
        stamina: Number(f.a_stamina),
      },
    },
    defender: {
      class: 'defender',
      level: Number(f.d_level),
      stats: {
        strength: Number(f.d_strength),
        agility: Number(f.d_agility),
        stamina: Number(f.d_stamina),
      },
    },
  };

  const res = await fetch('../backend/simulate_battle.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  battleResult.textContent = JSON.stringify(json, null, 2);
});
