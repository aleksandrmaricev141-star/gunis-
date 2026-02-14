const initialState = () => ({
  month: 1,
  year: 1,
  rank: 'Глава района',
  resources: { BUD: 1200, POL: 120, CAD: 18, EXP: 35, MED: 28, debt: 180 },
  policies: {
    centralization: 50,
    transparency: 45,
    hrPolicy: 50,
    budgetMode: 55,
    regulation: 50,
  },
  districts: [
    { id: 'orel', name: 'Орёл', type: 'Город', POP: 310, INF: 72, ECO: 74, LOY: 56, SERV: 63, RISK: 37, LOG: 1.2, budget: allocTemplate() },
    { id: 'livny', name: 'Ливны', type: 'Город', POP: 47, INF: 58, ECO: 55, LOY: 52, SERV: 54, RISK: 42, LOG: 1.05, budget: allocTemplate() },
    { id: 'mtsensk', name: 'Мценск', type: 'Город', POP: 37, INF: 60, ECO: 57, LOY: 50, SERV: 51, RISK: 40, LOG: 1.08, budget: allocTemplate() },
    { id: 'bolkhov', name: 'Болховский', type: 'Район', POP: 22, INF: 46, ECO: 43, LOY: 51, SERV: 45, RISK: 47, LOG: 0.93, budget: allocTemplate() },
    { id: 'dmitrovsky', name: 'Дмитровский', type: 'Район', POP: 15, INF: 44, ECO: 42, LOY: 49, SERV: 46, RISK: 48, LOG: 0.91, budget: allocTemplate() },
    { id: 'novoderevenkovsky', name: 'Новодеревеньковский', type: 'Район', POP: 16, INF: 42, ECO: 41, LOY: 48, SERV: 44, RISK: 50, LOG: 0.9, budget: allocTemplate() },
    { id: 'sverdlovsky', name: 'Свердловский', type: 'Район', POP: 19, INF: 45, ECO: 44, LOY: 50, SERV: 46, RISK: 46, LOG: 0.95, budget: allocTemplate() },
    { id: 'verkhovsky', name: 'Верховский', type: 'Район', POP: 17, INF: 43, ECO: 40, LOY: 47, SERV: 43, RISK: 52, LOG: 0.88, budget: allocTemplate() },
    { id: 'pokrovsky', name: 'Покровский', type: 'Район', POP: 20, INF: 47, ECO: 45, LOY: 52, SERV: 47, RISK: 45, LOG: 0.98, budget: allocTemplate() },
  ],
  selectedDistrictId: 'orel',
  mapMode: 'LOY',
  careerScore: 52,
  supportScore: 54,
  focuses: [
    { id: 'project-office', name: 'Проектный офис', branch: 'Эффективный менеджер', days: 35, progress: 0, active: false, done: false, effect: () => ({ buildBoost: 0.1 }) },
    { id: 'elite-coalition', name: 'Коалиции с элитами', branch: 'Политик', days: 35, progress: 0, active: false, done: false, effect: () => ({ POL: 18, LOY: 2 }) },
    { id: 'digital-mfc', name: 'Цифровизация МФЦ', branch: 'Реформатор', days: 35, progress: 0, active: false, done: false, effect: () => ({ SERV: 4, MED: 4 }) },
    { id: 'anticorruption', name: 'Антикоррупционный блок', branch: 'Силовик', days: 35, progress: 0, active: false, done: false, effect: () => ({ RISK: -4, POL: -5 }) },
  ],
  reforms: [
    { id: 'appeal-platform', name: 'Единая платформа обращений', costExp: 40, costBud: 120, progress: 0, duration: 90, active: false, done: false },
    { id: 'transport-scheme', name: 'Сквозная транспортная схема', costExp: 55, costBud: 340, progress: 0, duration: 120, active: false, done: false },
    { id: 'housing-dispatch', name: 'Цифровая диспетчеризация ЖКХ', costExp: 35, costBud: 160, progress: 0, duration: 80, active: false, done: false },
  ],
  teams: { crisis: 0, eco: 0 },
  log: ['Игра запущена. Вы — глава района.'],
  modifiers: {
    buildBoost: 0,
    scandalReduction: 0,
    logisticsBoost: 0,
  },
});

function allocTemplate() {
  return { infra: 35, social: 10, business: 10, apk: 15, housing: 20, reserve: 10 };
}

let state = initialState();

const els = {
  resourceCards: document.getElementById('resourceCards'),
  districtGrid: document.getElementById('districtGrid'),
  districtDetail: document.getElementById('districtDetail'),
  budgetControls: document.getElementById('budgetControls'),
  mapMode: document.getElementById('mapMode'),
  nextMonthBtn: document.getElementById('nextMonthBtn'),
  auto3Btn: document.getElementById('auto3Btn'),
  resetBtn: document.getElementById('resetBtn'),
  dateLabel: document.getElementById('dateLabel'),
  focusList: document.getElementById('focusList'),
  reformList: document.getElementById('reformList'),
  lawsList: document.getElementById('lawsList'),
  careerScore: document.getElementById('careerScore'),
  supportScore: document.getElementById('supportScore'),
  rdiScore: document.getElementById('rdiScore'),
  rankLabel: document.getElementById('rankLabel'),
  victoryLabel: document.getElementById('victoryLabel'),
  log: document.getElementById('log'),
  deployCrisisTeam: document.getElementById('deployCrisisTeam'),
  deployEcoTeam: document.getElementById('deployEcoTeam'),
};

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function fmtMoney(v) { return `${v.toFixed(1)} млн`; }

function getDistrictById(id) {
  return state.districts.find((d) => d.id === id);
}

function weightedRdi() {
  let sum = 0;
  let wsum = 0;
  for (const d of state.districts) {
    const budgetDiscipline = 70 - Math.max(0, state.resources.debt - 300) / 20;
    const projectCompletion = 55 + state.modifiers.buildBoost * 40;
    const rei = 0.3 * d.INF + 0.25 * d.ECO + 0.2 * d.SERV + 0.15 * budgetDiscipline + 0.1 * projectCompletion;
    const w = Math.sqrt(d.POP);
    sum += rei * w;
    wsum += w;
  }
  return sum / wsum;
}

function supportIndex() {
  const avgServ = avg('SERV');
  const incomeTrend = avg('ECO') - 50;
  const mediaClimate = clamp(state.resources.MED + (state.policies.transparency - 50) / 2, 0, 100);
  const crisisHandling = clamp(70 - avg('RISK') + state.teams.crisis * 2, 0, 100);
  return clamp(0.4 * avgServ + 0.3 * (incomeTrend + 50) + 0.2 * mediaClimate + 0.1 * crisisHandling, 0, 100);
}

function avg(key) {
  return state.districts.reduce((acc, d) => acc + d[key], 0) / state.districts.length;
}

function render() {
  renderResources();
  renderDate();
  renderMap();
  renderDistrictDetail();
  renderFocuses();
  renderReforms();
  renderLaws();
  renderMetrics();
  renderLog();
}

function renderResources() {
  const cards = [
    ['BUD', fmtMoney(state.resources.BUD)],
    ['POL', state.resources.POL.toFixed(1)],
    ['CAD', state.resources.CAD.toFixed(0)],
    ['EXP', state.resources.EXP.toFixed(1)],
    ['MED', state.resources.MED.toFixed(1)],
  ];
  els.resourceCards.innerHTML = cards.map(([name, value]) => `
    <div class="resource-card">
      <div class="name">${name}</div>
      <div class="value">${value}</div>
    </div>
  `).join('');
}

function renderDate() {
  els.dateLabel.textContent = `Месяц ${state.month}, Год ${state.year}`;
}

function scoreToColor(value, mode) {
  const normalized = mode === 'RISK' ? 100 - value : value;
  const r = Math.round(220 - normalized * 1.8);
  const g = Math.round(30 + normalized * 1.8);
  return `rgb(${clamp(r, 35, 220)}, ${clamp(g, 35, 220)}, 70)`;
}

function renderMap() {
  els.districtGrid.innerHTML = state.districts.map((d) => `
    <button class="district-btn ${d.id === state.selectedDistrictId ? 'active' : ''}"
      data-id="${d.id}" style="background:${scoreToColor(d[state.mapMode], state.mapMode)}">
      <div><strong>${d.name}</strong></div>
      <div class="mini">${d.type} · ${state.mapMode}: ${d[state.mapMode].toFixed(1)}</div>
      <div class="mini">POP: ${d.POP}k · LOG: ${d.LOG.toFixed(2)}</div>
    </button>
  `).join('');

  [...els.districtGrid.querySelectorAll('.district-btn')].forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedDistrictId = btn.dataset.id;
      render();
    });
  });
}

function renderDistrictDetail() {
  const d = getDistrictById(state.selectedDistrictId);
  els.districtDetail.innerHTML = `
    <p><strong>${d.name}</strong> (${d.type})</p>
    <p class="small">POP: ${d.POP}k | INF: ${d.INF.toFixed(1)} | ECO: ${d.ECO.toFixed(1)} | LOY: ${d.LOY.toFixed(1)} | SERV: ${d.SERV.toFixed(1)} | RISK: ${d.RISK.toFixed(1)}</p>
  `;

  const labels = [
    ['infra', 'Инфраструктура'], ['social', 'Соцсфера'], ['business', 'Бизнес'],
    ['apk', 'АПК'], ['housing', 'ЖКХ'], ['reserve', 'Резерв'],
  ];

  els.budgetControls.innerHTML = labels.map(([key, text]) => `
    <div class="budget-row">
      <span>${text}</span>
      <input type="range" min="0" max="60" value="${d.budget[key]}" data-key="${key}" />
      <strong>${d.budget[key]}%</strong>
    </div>
  `).join('');

  [...els.budgetControls.querySelectorAll('input[type="range"]')].forEach((slider) => {
    slider.addEventListener('input', () => {
      d.budget[slider.dataset.key] = Number(slider.value);
      normalizeBudget(d.budget, slider.dataset.key);
      renderDistrictDetail();
    });
  });
}

function normalizeBudget(budget, changedKey) {
  const keys = Object.keys(budget);
  const sum = keys.reduce((a, k) => a + budget[k], 0);
  if (sum === 100) return;
  const restKeys = keys.filter((k) => k !== changedKey);
  const delta = sum - 100;
  for (const k of restKeys) {
    budget[k] = clamp(Math.round(budget[k] - delta / restKeys.length), 0, 70);
  }
  const fixed = keys.reduce((a, k) => a + budget[k], 0);
  if (fixed !== 100) {
    budget.reserve = clamp(budget.reserve + (100 - fixed), 0, 70);
  }
}

function renderFocuses() {
  els.focusList.innerHTML = state.focuses.map((f) => {
    const pct = Math.round((f.progress / f.days) * 100);
    return `
      <div class="item">
        <div><strong>${f.name}</strong> <span class="small">(${f.branch})</span></div>
        <div class="small">Прогресс: ${pct}% ${f.done ? '✅' : ''}</div>
        <button data-focus="${f.id}" ${f.active || f.done ? 'disabled' : ''}>Запустить</button>
      </div>
    `;
  }).join('');

  [...els.focusList.querySelectorAll('button[data-focus]')].forEach((btn) => {
    btn.addEventListener('click', () => {
      const selected = state.focuses.find((f) => f.id === btn.dataset.focus);
      if (state.focuses.some((f) => f.active)) {
        pushLog('Уже активен другой фокус.');
        return;
      }
      selected.active = true;
      pushLog(`Запущен фокус: ${selected.name}`);
      render();
    });
  });
}

function renderReforms() {
  els.reformList.innerHTML = state.reforms.map((r) => `
    <div class="item">
      <div><strong>${r.name}</strong></div>
      <div class="small">Стоимость: EXP ${r.costExp}, BUD ${r.costBud} млн</div>
      <div class="small">Прогресс: ${Math.round((r.progress / r.duration) * 100)}% ${r.done ? '✅' : ''}</div>
      <button data-reform="${r.id}" ${r.active || r.done ? 'disabled' : ''}>Исследовать</button>
    </div>
  `).join('');

  [...els.reformList.querySelectorAll('button[data-reform]')].forEach((btn) => {
    btn.addEventListener('click', () => {
      const r = state.reforms.find((x) => x.id === btn.dataset.reform);
      if (state.reforms.some((x) => x.active)) {
        pushLog('Только 1 активная реформа одновременно.');
        return;
      }
      if (state.resources.EXP < r.costExp || state.resources.BUD < r.costBud) {
        pushLog('Недостаточно ресурсов для реформы.');
        return;
      }
      state.resources.EXP -= r.costExp;
      state.resources.BUD -= r.costBud;
      r.active = true;
      pushLog(`Старт реформы: ${r.name}`);
      render();
    });
  });
}

function renderLaws() {
  const laws = [
    ['centralization', 'Централизация'],
    ['transparency', 'Прозрачность'],
    ['hrPolicy', 'Кадровая политика'],
    ['budgetMode', 'Бюджетный режим'],
    ['regulation', 'Регуляторная среда'],
  ];

  els.lawsList.innerHTML = laws.map(([key, label]) => `
    <label>
      <span>${label}</span>
      <input type="range" min="0" max="100" value="${state.policies[key]}" data-law="${key}" />
      <strong>${state.policies[key]}</strong>
    </label>
  `).join('');

  [...els.lawsList.querySelectorAll('input[data-law]')].forEach((slider) => {
    slider.addEventListener('input', () => {
      state.policies[slider.dataset.law] = Number(slider.value);
      renderLaws();
    });
  });
}

function renderMetrics() {
  const rdi = weightedRdi();
  const sup = supportIndex();
  state.supportScore = sup;
  const efficiencyIndex = rdi;
  const loyaltyIndex = avg('LOY');
  const crisisScore = 100 - avg('RISK');
  const federalTrust = clamp(50 + (state.resources.POL - 100) / 2 + (state.policies.transparency - 50) / 4, 0, 100);

  state.careerScore = 0.35 * efficiencyIndex + 0.25 * loyaltyIndex + 0.2 * crisisScore + 0.2 * federalTrust;

  if (state.careerScore >= 85) state.rank = 'Губернатор';
  else if (state.careerScore >= 75) state.rank = 'Вице-губернатор';
  else if (state.careerScore >= 60) state.rank = 'Кандидат на повышение';
  else state.rank = 'Глава района';

  const victory = state.rank === 'Губернатор' && rdi >= 75 && sup >= 60;

  els.careerScore.textContent = state.careerScore.toFixed(1);
  els.supportScore.textContent = sup.toFixed(1);
  els.rdiScore.textContent = rdi.toFixed(1);
  els.rankLabel.textContent = state.rank;
  els.victoryLabel.innerHTML = victory ? '<span class="good">Выполнено</span>' : '<span class="bad">Пока нет</span>';
}

function renderLog() {
  els.log.innerHTML = state.log.slice(-30).reverse().map((line) => `<div class="log-entry">${line}</div>`).join('');
}

function processMonth() {
  progressFocus();
  progressReform();
  for (const d of state.districts) {
    const b = d.budget;
    const baseBuildRate = 0.6 * (b.infra / 35);
    const logisticsModifier = d.LOG - 1 + state.modifiers.logisticsBoost;
    const teamBonus = state.teams.eco > 0 ? 0.08 : 0;
    const wear = clamp(0.35 - b.housing / 100, 0.1, 0.35);

    d.INF = clamp(d.INF + baseBuildRate * (1 + logisticsModifier + teamBonus + state.modifiers.buildBoost) - wear, 0, 100);

    const ecoGrowth = 0.25 * d.LOG * (1 + b.business / 100 + state.modifiers.logisticsBoost);
    d.ECO = clamp(d.ECO + ecoGrowth - d.RISK / 220, 0, 100);

    d.SERV = clamp(d.SERV + b.social / 120 + b.housing / 130 - d.RISK / 160, 0, 100);

    const mediaLocalEffect = (state.resources.MED - 30) / 80;
    const crisisPenalty = d.RISK / 200;
    d.LOY = clamp(d.LOY + 0.15 * ((d.SERV - 50) / 10) + 0.1 * ((d.ECO - 50) / 10) + mediaLocalEffect - crisisPenalty, 0, 100);

    const crisisDecay = 0.25 + (state.teams.crisis > 0 ? 0.8 : 0) + state.policies.centralization / 500;
    d.RISK = clamp(d.RISK - crisisDecay + randomBetween(-0.3, 0.6), 0, 100);
  }

  const debtRatio = state.resources.debt / Math.max(1, state.resources.BUD + 400);
  const transfers = 25 + state.policies.centralization / 8;
  const taxBase = avg('ECO') * 12;
  const leakage = (100 - state.policies.transparency) / 9;

  const deltaBUD = taxBase * (0.12 + avg('ECO') / 500) + transfers - 12 - leakage;
  const debtPenalty = debtRatio > 0.7 ? 10 : 0;
  state.resources.BUD = clamp(state.resources.BUD + deltaBUD - debtPenalty, 0, 5000);

  const focusMod = state.focuses.some((f) => f.done && f.id === 'elite-coalition') ? 0.8 : 0;
  state.resources.POL = clamp(state.resources.POL + 0.4 * (avg('LOY') - 50) / 10 + focusMod - (debtRatio > 0.7 ? 2 : 0), 0, 300);

  const thinkTankLevel = state.reforms.filter((r) => r.done).length;
  state.resources.EXP = clamp(state.resources.EXP + 0.2 * thinkTankLevel + 0.15 - state.teams.crisis * 0.08, 0, 300);

  const scandalPenalty = randomChance(scandalChance()) ? 4 : 0;
  state.resources.MED = clamp(state.resources.MED + 0.3 + state.policies.transparency / 300 - scandalPenalty, 0, 120);

  maybeCrisisEvent();

  state.month += 1;
  if (state.month > 12) {
    state.month = 1;
    state.year += 1;
    yearlyPromotionCheck();
  }

  pushLog(`Месяц завершён: BUD ${fmtMoney(state.resources.BUD)}, POL ${state.resources.POL.toFixed(1)}, SUP ${supportIndex().toFixed(1)}`);
}

function progressFocus() {
  const active = state.focuses.find((f) => f.active);
  if (!active) return;
  const advisorBonus = state.resources.EXP / 300;
  const focusTime = 35 * (1 - Math.min(0.35, state.resources.EXP / 300 + advisorBonus));
  active.progress += 30 / focusTime * 35;
  if (active.progress >= active.days) {
    active.active = false;
    active.done = true;
    applyFocusEffect(active);
    pushLog(`Фокус завершён: ${active.name}`);
  }
}

function applyFocusEffect(focus) {
  const effect = focus.effect();
  if (effect.buildBoost) state.modifiers.buildBoost += effect.buildBoost;
  if (effect.POL) state.resources.POL = clamp(state.resources.POL + effect.POL, 0, 300);
  if (effect.LOY) state.districts.forEach((d) => (d.LOY = clamp(d.LOY + effect.LOY, 0, 100)));
  if (effect.SERV) state.districts.forEach((d) => (d.SERV = clamp(d.SERV + effect.SERV, 0, 100)));
  if (effect.MED) state.resources.MED = clamp(state.resources.MED + effect.MED, 0, 120);
  if (effect.RISK) state.districts.forEach((d) => (d.RISK = clamp(d.RISK + effect.RISK, 0, 100)));
}

function progressReform() {
  const active = state.reforms.find((r) => r.active);
  if (!active) return;
  const stabilityFactor = clamp(1 + (supportIndex() - 50) / 120, 0.7, 1.4);
  const chiefAnalystSkill = 6;
  const progress = 30 * (1 + state.resources.EXP / 200 + chiefAnalystSkill / 10) * stabilityFactor;
  active.progress += progress;

  if (active.progress >= active.duration) {
    active.active = false;
    active.done = true;
    if (active.id === 'appeal-platform') {
      state.districts.forEach((d) => (d.SERV = clamp(d.SERV + 8, 0, 100)));
      state.modifiers.scandalReduction += 0.05;
    }
    if (active.id === 'transport-scheme') {
      state.districts.forEach((d) => (d.LOG = clamp(d.LOG + 0.12, 0.7, 1.3)));
      state.modifiers.logisticsBoost += 0.06;
    }
    if (active.id === 'housing-dispatch') {
      state.districts.forEach((d) => {
        d.SERV = clamp(d.SERV + 5, 0, 100);
        d.RISK = clamp(d.RISK - 4, 0, 100);
      });
    }
    pushLog(`Реформа внедрена: ${active.name}`);
  }
}

function scandalChance() {
  const corruptionPressure = (100 - state.policies.transparency) / 40;
  const transparencyLevel = state.policies.transparency / 100;
  const mediaControl = state.resources.MED / 200 + state.modifiers.scandalReduction;
  return clamp(0.06 + corruptionPressure / 10 - transparencyLevel / 10 - mediaControl / 10, 0.01, 0.4);
}

function maybeCrisisEvent() {
  if (randomChance(0.15)) {
    const d = state.districts[Math.floor(Math.random() * state.districts.length)];
    const severity = Math.round(randomBetween(1, 3));
    if (severity === 1) {
      d.RISK = clamp(d.RISK + 4, 0, 100);
      state.resources.POL = clamp(state.resources.POL - 3, 0, 300);
      pushLog(`Событие: локальный скандал в ${d.name}. RISK +4`);
    } else if (severity === 2) {
      d.SERV = clamp(d.SERV - 4, 0, 100);
      state.resources.BUD = clamp(state.resources.BUD - 45, 0, 5000);
      pushLog(`Событие: авария ЖКХ в ${d.name}. SERV -4, BUD -45 млн`);
    } else {
      d.RISK = clamp(d.RISK + 8, 0, 100);
      state.resources.POL = clamp(state.resources.POL - 8, 0, 300);
      pushLog(`Кризис: проверка/протест в ${d.name}. POL -8`);
    }
  }
}

function yearlyPromotionCheck() {
  renderMetrics();
  const federalTrustBonus = (state.policies.transparency - 50) / 100;
  const scandalPenalty = avg('RISK') > 55 ? 0.15 : 0;
  const p = clamp(0.05 + (state.careerScore - 50) * 0.015 + federalTrustBonus - scandalPenalty, 0, 0.85);
  if (randomChance(p)) pushLog(`Карьерное событие: ваши позиции укрепились (шанс ${Math.round(p * 100)}%).`);
  else pushLog(`Карьерное событие: повышение отложено (шанс ${Math.round(p * 100)}%).`);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomChance(prob) {
  return Math.random() < prob;
}

function pushLog(text) {
  state.log.push(`[Г${state.year} М${state.month}] ${text}`);
}

els.mapMode.addEventListener('change', (e) => {
  state.mapMode = e.target.value;
  renderMap();
});

els.nextMonthBtn.addEventListener('click', () => {
  processMonth();
  render();
});

els.auto3Btn.addEventListener('click', () => {
  for (let i = 0; i < 3; i += 1) processMonth();
  render();
});

els.resetBtn.addEventListener('click', () => {
  state = initialState();
  pushLog('Состояние сброшено.');
  render();
});

els.deployCrisisTeam.addEventListener('click', () => {
  if (state.resources.CAD < 2) {
    pushLog('Недостаточно кадрового резерва для антикризисной команды.');
    renderLog();
    return;
  }
  state.resources.CAD -= 2;
  state.teams.crisis += 1;
  pushLog('Развернута антикризисная команда: ResponseTime -30%, RISK decay +0.8');
  render();
});

els.deployEcoTeam.addEventListener('click', () => {
  if (state.resources.CAD < 2) {
    pushLog('Недостаточно кадрового резерва для экономического штаба.');
    renderLog();
    return;
  }
  state.resources.CAD -= 2;
  state.teams.eco += 1;
  pushLog('Развернут экономический штаб: ускорение инфраструктурных проектов.');
  render();
});

render();
