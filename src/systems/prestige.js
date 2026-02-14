import { defaultState } from '../core/state.js';
import { prestigeGain } from '../core/economy.js';

export function renderPrestige(state) {
  const gain = prestigeGain(state);
  document.getElementById('prestigeHint').textContent = `При перерождении получите +${gain} эссенции.`;
  document.getElementById('prestigeButton').disabled = gain <= 0;
}

export function doPrestige(state) {
  const gain = prestigeGain(state);
  if (gain <= 0) return;

  const keep = {
    playerId: state.playerId,
    playerName: state.playerName,
    isAdmin: state.isAdmin,
    leaderboardPlayers: state.leaderboardPlayers,
    leaderboardGuilds: state.leaderboardGuilds,
    guilds: state.guilds,
    activeGuild: state.activeGuild,
    essence: state.essence + gain,
    crystals: Math.floor(state.crystals * 0.25)
  };

  Object.assign(state, defaultState(), keep);
}
