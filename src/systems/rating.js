import { rating } from '../core/economy.js';
import { guildLeaderboard } from './guilds.js';

export function updateLeaderboards(state) {
  const score = rating(state);
  state.lastRating = score;

  const existing = state.leaderboardPlayers.find((p) => p.id === state.playerId);
  if (existing) {
    existing.name = state.playerName;
    existing.score = score;
    existing.level = state.level || 1;
  } else {
    state.leaderboardPlayers.push({ id: state.playerId, name: state.playerName, score, level: state.level || 1 });
  }

  state.leaderboardPlayers = [...state.leaderboardPlayers]
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);

  state.leaderboardGuilds = guildLeaderboard(state);
}

export function clearLeaderboards(state) {
  state.leaderboardPlayers = [];
  state.leaderboardGuilds = [];
}

export function renderRating(state) {
  document.getElementById('ratingScore').textContent = state.lastRating;

  const board = document.getElementById('ratingBoard');
  board.innerHTML = '';
  state.leaderboardPlayers.slice(0, 20).forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = `${entry.name} (ур.${entry.level}): ${entry.score}`;
    board.appendChild(li);
  });

  const guildBoard = document.getElementById('guildBoard');
  guildBoard.innerHTML = '';
  state.leaderboardGuilds.slice(0, 20).forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = `${entry.name}: ${entry.score}`;
    guildBoard.appendChild(li);
  });
}
