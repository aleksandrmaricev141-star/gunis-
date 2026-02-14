import { createGuildQuests, todayKey } from '../core/state.js';

function ensureGuildDaily(state) {
  if (state.guildQuestKey !== todayKey()) {
    state.guildQuestKey = todayKey();
    state.guildQuests = createGuildQuests(state.guildQuestKey);
  }
}

function guildLevelFromXp(xp) {
  return Math.floor(Math.sqrt(xp / 160)) + 1;
}

function activeGuild(state) {
  return state.guilds.find((g) => g.id === state.activeGuild);
}

export function trackGuild(state, type, amount) {
  ensureGuildDaily(state);
  const guild = activeGuild(state);
  if (!guild) return;

  state.guildQuests.forEach((q) => {
    if (q.done || q.type !== type) return;
    q.progress = Math.min(q.target, q.progress + amount);
    if (q.progress >= q.target) {
      q.done = true;
      guild.xp += q.rewardGuildXp;
      guild.level = guildLevelFromXp(guild.xp);
      state.crystals += q.rewardCrystals;
    }
  });
}

export function createGuild(state, name) {
  const trimmed = name.trim();
  if (!trimmed || state.crystals < 150) return { ok: false, reason: 'Недостаточно кристаллов или пустое имя' };
  const exists = state.guilds.some((g) => g.name.toLowerCase() === trimmed.toLowerCase());
  if (exists) return { ok: false, reason: 'Гильдия с таким именем уже есть' };

  state.crystals -= 150;
  const id = `custom_${Date.now()}`;
  state.guilds.push({ id, name: trimmed, level: 1, treasury: 0, bonusClick: 1, bonusPassive: 1, members: 1, xp: 0 });
  state.activeGuild = id;
  return { ok: true };
}

export function donateToGuild(state) {
  const guild = activeGuild(state);
  if (!guild || state.energy < 300) return;
  state.energy -= 300;
  guild.treasury += 300;
  guild.xp += 20;
  guild.level = guildLevelFromXp(guild.xp);
}

export function buyGuildBuff(state) {
  const guild = activeGuild(state);
  if (!guild || guild.treasury < 200) return;
  guild.treasury -= 200;
  guild.bonusClick += 1;
  guild.bonusPassive += 1;
}

export function guildLeaderboard(state) {
  return [...state.guilds]
    .map((g) => ({ name: g.name, score: g.level * 200 + g.xp + g.treasury + g.members * 80 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

export function renderGuilds(state, refresh) {
  ensureGuildDaily(state);
  const status = document.getElementById('guildStatus');
  const list = document.getElementById('guildList');
  const quests = document.getElementById('guildQuestsList');
  const board = document.getElementById('guildBoard');

  const guild = activeGuild(state);
  status.textContent = guild
    ? `Гильдия: ${guild.name} | Уровень ${guild.level} | Казна ${guild.treasury} | Бонус +${guild.bonusClick} click / +${guild.bonusPassive} passive`
    : 'Вы пока не вступили в гильдию.';

  list.innerHTML = '';
  state.guilds.forEach((g) => {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `<strong>${g.name}</strong><br><span class="hint">Lvl ${g.level} | Участники ${g.members}</span>`;
    const btn = document.createElement('button');
    btn.className = 'btn';

    if (state.activeGuild === g.id) {
      btn.textContent = 'Ваша гильдия';
      btn.disabled = true;
    } else {
      btn.textContent = 'Вступить';
      btn.onclick = () => {
        const prev = activeGuild(state);
        if (prev && prev.members > 0) prev.members -= 1;
        g.members += 1;
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

  board.innerHTML = '';
  guildLeaderboard(state).forEach((g) => {
    const li = document.createElement('li');
    li.textContent = `${g.name}: ${g.score}`;
    board.appendChild(li);
  });
}
