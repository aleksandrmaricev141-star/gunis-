import { rating } from '../core/economy.js';

const bots = [
  { name: 'Nova', score: 1200 },
  { name: 'Helix', score: 2600 },
  { name: 'Cipher', score: 4500 }
];

export function renderRating(state) {
  const score = rating(state);
  state.lastRating = score;
  document.getElementById('ratingScore').textContent = score;

  const board = document.getElementById('ratingBoard');
  board.innerHTML = '';
  [...bots, { name: 'Вы', score }]
    .sort((a, b) => b.score - a.score)
    .forEach((entry) => {
      const li = document.createElement('li');
      li.textContent = `${entry.name}: ${entry.score}`;
      board.appendChild(li);
    });
}
