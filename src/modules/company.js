import { rankByRep, state } from './state.js';
import { log } from '../ui/logger.js';

export function updateCompanyProgress() {
  if (state.reputation < 80) return;

  state.company.inCompany = true;
  state.company.name = 'ГородСервис';

  let activeRank = rankByRep[0];
  for (const rank of rankByRep) {
    if (state.reputation >= rank.rep) activeRank = rank;
  }

  const prev = state.company.rank;
  state.company.rank = activeRank.rank;
  state.company.cut = activeRank.cut;

  if (prev !== activeRank.rank) {
    log(`🏆 Повышение в компании: <b>${activeRank.rank}</b>`, 'ok');
  }
}
