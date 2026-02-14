import { storyChapters } from '../config/gameData.js';
import { levelFromXp, rating } from '../core/economy.js';

function taskDone(state, task) {
  const totalUpgrades = Object.values(state.upgradeLevels).reduce((a, b) => a + b, 0);
  const guild = state.guilds.find((g) => g.id === state.activeGuild);
  const guildLevel = guild?.level || 0;

  switch (task.type) {
    case 'clicks': return state.clicks >= task.target;
    case 'energy': return state.energy >= task.target;
    case 'upgrades': return totalUpgrades >= task.target;
    case 'totalEarned': return state.totalEarned >= task.target;
    case 'level': return levelFromXp(state.xp) >= task.target;
    case 'crystals': return state.crystals >= task.target;
    case 'rating': return rating(state) >= task.target;
    case 'skins': return state.unlockedSkins.length >= task.target;
    case 'guildLevel': return guildLevel >= task.target;
    default: return false;
  }
}

export function renderStory(state, refresh) {
  const wrap = document.getElementById('storyList');
  const art = document.getElementById('artifactList');
  wrap.innerHTML = '';
  art.innerHTML = '';

  storyChapters.forEach((chapter) => {
    const done = state.completedChapters.includes(chapter.id);
    const div = document.createElement('div');
    div.className = 'item';

    const tasks = chapter.tasks
      .map((t) => `<li class="${taskDone(state, t) ? 'done' : ''}">${t.text} ${taskDone(state, t) ? '✓' : ''}</li>`)
      .join('');

    div.innerHTML = `<strong>${chapter.title}</strong><ul>${tasks}</ul><p class="hint">Артефакт: ${chapter.artifact.name} (${chapter.artifact.desc})</p>`;

    if (!done && chapter.tasks.every((t) => taskDone(state, t))) {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = 'Забрать артефакт';
      btn.onclick = () => {
        state.completedChapters.push(chapter.id);
        state.artifacts.push(chapter.artifact);
        refresh();
      };
      div.appendChild(btn);
    }

    if (done) {
      const p = document.createElement('p');
      p.className = 'done';
      p.textContent = 'Глава завершена';
      div.appendChild(p);
    }

    wrap.appendChild(div);
  });

  if (!state.artifacts.length) {
    art.innerHTML = '<li class="hint">Нет артефактов</li>';
  } else {
    state.artifacts.forEach((a) => {
      const li = document.createElement('li');
      li.textContent = `${a.name}: ${a.desc}`;
      art.appendChild(li);
    });
  }
}
