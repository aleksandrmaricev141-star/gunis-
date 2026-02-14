import { guilds } from '../config/gameData.js';
import { createGuildQuests, todayKey } from '../core/state.js';

function ensureGuildDaily(state) {
  if (state.guildQuestKey !== todayKey()) {
    state.guildQuestKey = todayKey();
    state.guildQuests = createGuildQuests(state.guildQuestKey);
  }
}

export function trackGuild(state, type, amount) {
  ensureGuildDaily(state);
  if (!state.activeGuild) return;

  state.guildQuests.forEach((q) => {
    if (q.done || q.type !== type) return;
    q.progress = Math.min(q.target, q.progress + amount);
    if (q.progress >= q.target) {
      q.done = true;
      state.guildXp += q.rewardGuildXp;
      state.crystals += q.rewardCrystals;
    }
  });
}

export function renderGuilds(state, refresh) {
  ensureGuildDaily(state);
  const status = document.getElementById('guildStatus');
  const list = document.getElementById('guildList');
  const quests = document.getElementById('guildQuestsList');
  const board = document.getElementById('guildBoard');

  const active = guilds.find((g) => g.id === state.activeGuild);
  status.textContent = active
    ? `Вы в гильдии ${active.name}. Бонус: +${active.bonusClick} к клику, +${active.bonusPassive} пассив.`
    : 'Вы не состоите в гильдии.';

  list.innerHTML = '';
  guilds.forEach((g) => {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `<strong>${g.name}</strong><br><span class="hint">Бонус: +${g.bonusClick} click / +${g.bonusPassive} passive</span>`;
    const btn = document.createElement('button');
    btn.className = 'btn';

    if (state.activeGuild === g.id) {
      btn.textContent = 'Вы в гильдии';
      btn.disabled = true;
    } else {
      btn.textContent = 'Вступить';
      btn.onclick = () => {
        state.activeGuild = g.id;
        refresh();
      };
    }

    li.appendChild(btn);
    list.appendChild(li);
  });

  quests.innerHTML = '';
  state.guildQuests.forEach((q) => {
    const li = document.createElement('li');
    li.className = `item ${q.done ? 'done' : ''}`;
    li.textContent = `${q.text} — ${q.progress}/${q.target} | +${q.rewardGuildXp} XP +${q.rewardCrystals}💎`;
    quests.appendChild(li);
  });

  const guildPower = state.guildXp + (state.activeGuild ? 100 : 0);
  const boardItems = [
    { name: 'Iron Forge', power: 900 },
    { name: 'Pulse Order', power: 1050 },
    { name: 'Shadow Veil', power: 980 },
    { name: 'Ваша гильдия', power: guildPower }
  ].sort((a, b) => b.power - a.power);

  board.innerHTML = '';
  boardItems.forEach((b) => {
    const li = document.createElement('li');
    li.textContent = `${b.name}: ${b.power}`;
    board.appendChild(li);
  });
}
