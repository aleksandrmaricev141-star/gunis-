import { storyChapters } from '../config/gameData.js';

export function renderStory(state, refresh) {
  const wrap = document.getElementById('storyList');
  const art = document.getElementById('artifactList');
  wrap.innerHTML = '';
  art.innerHTML = '';

  storyChapters.forEach((chapter) => {
    const done = state.completedChapters.includes(chapter.id);
    const div = document.createElement('div');
    div.className = 'item';

    const tasks = chapter.tasks.map((t) => `<li class="${t.done(state) ? 'done' : ''}">${t.text} ${t.done(state) ? '✓' : ''}</li>`).join('');
    div.innerHTML = `<strong>${chapter.title}</strong><ul>${tasks}</ul><p class="hint">Артефакт: ${chapter.artifact.name} (${chapter.artifact.desc})</p>`;

    if (!done && chapter.tasks.every((t) => t.done(state))) {
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
    const li = document.createElement('li');
    li.className = 'hint';
    li.textContent = 'Нет артефактов';
    art.appendChild(li);
  } else {
    state.artifacts.forEach((a) => {
      const li = document.createElement('li');
      li.textContent = `${a.name}: ${a.desc}`;
      art.appendChild(li);
    });
  }
}
