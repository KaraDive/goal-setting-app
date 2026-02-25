// ── Step 1: Funnel table ──

function buildFunnelTable() {
  const steps = state.settings.steps;
  const tbody = document.getElementById('funnel-body');
  tbody.innerHTML = '';

  const sel = document.getElementById('biggest-gap-select');
  sel.innerHTML = '<option value="">— Detecting... —</option>';

  steps.forEach((step, i) => {
    const tr = document.createElement('tr');
    tr.id = `funnel-row-${i}`;
    tr.innerHTML = `
      <td style="font-weight:600;font-size:13px">${step.name}</td>
      <td><input type="number" id="funnel-my-${i}" placeholder="%" min="0" max="100" oninput="updateFunnelCalcs()"></td>
      <td style="color:var(--muted);font-size:13px">${step.standardMin}–${step.standardMax}%</td>
      <td class="gap-cell" id="funnel-gap-${i}">—</td>
    `;
    tbody.appendChild(tr);

    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = step.name;
    sel.appendChild(opt);
  });
}

function updateFunnelCalcs() {
  const steps = state.settings.steps;
  let worstGapIndex = -1;
  let worstGapAmount = -Infinity;

  steps.forEach((step, i) => {
    const input = document.getElementById(`funnel-my-${i}`);
    const myPct = parseFloat(input.value);
    const cell = document.getElementById(`funnel-gap-${i}`);
    const row = document.getElementById(`funnel-row-${i}`);

    row.classList.remove('biggest-gap-row');

    if (!isNaN(myPct)) {
      const midStandard = (step.standardMin + step.standardMax) / 2;
      const gap = midStandard - myPct;
      const gapPct = Math.round(gap);

      cell.textContent = gapPct > 0 ? `▼ ${gapPct}%` : gapPct < 0 ? `▲ ${Math.abs(gapPct)}%` : '✓ On track';
      cell.className = 'gap-cell ' + (gapPct > 15 ? 'gap-high' : gapPct > 0 ? 'gap-mid' : 'gap-good');

      if (gapPct > worstGapAmount) {
        worstGapAmount = gapPct;
        worstGapIndex = i;
      }
    } else {
      cell.textContent = '—';
      cell.className = 'gap-cell';
    }
  });

  if (worstGapIndex >= 0) {
    const step = steps[worstGapIndex];
    const myVal = parseFloat(document.getElementById(`funnel-my-${worstGapIndex}`).value);

    document.getElementById('biggest-gap-select').value = worstGapIndex;
    document.getElementById('gap-current-pct').value = myVal;
    document.getElementById('gap-standard-pct').value = Math.round((step.standardMin + step.standardMax) / 2);
    document.getElementById('auto-gap-badge').style.display = 'inline';

    document.getElementById(`funnel-row-${worstGapIndex}`).classList.add('biggest-gap-row');

    state.biggestGap = {
      index: worstGapIndex,
      name: step.name,
      currentPct: myVal,
      standardPct: Math.round((step.standardMin + step.standardMax) / 2)
    };

    syncGapToGoals();
  }

  state.funnelData = steps.map((s, i) => ({
    name: s.name,
    myPct: parseFloat(document.getElementById(`funnel-my-${i}`).value) || null
  }));
}

function syncGapToGoals() {
  const idx = parseInt(document.getElementById('biggest-gap-select').value);
  if (isNaN(idx)) return;
  const steps = state.settings.steps;
  const step = steps[idx];
  const myPct = parseFloat(document.getElementById(`funnel-my-${idx}`).value) || null;

  document.getElementById('gap-current-pct').value = myPct || '';
  document.getElementById('gap-standard-pct').value = Math.round((step.standardMin + step.standardMax) / 2);

  state.biggestGap = {
    index: idx,
    name: step.name,
    currentPct: myPct,
    standardPct: Math.round((step.standardMin + step.standardMax) / 2)
  };
}

// ── Step 2: Set goals ──

function populateGoalsFromStep1() {
  if (state.biggestGap) {
    document.getElementById('growth-focus-step').value = state.biggestGap.name;
    document.getElementById('growth-current-pct').value = state.biggestGap.currentPct || '';
  }
  calcProjected();
  updateGoalsSummary();
}

function calcProjected() {
  const interactions = parseFloat(document.getElementById('goal-interactions').value) || 0;
  const days = parseFloat(document.getElementById('goal-days').value) || 5;
  const loa = parseFloat(document.getElementById('goal-loa').value) || 0;

  if (interactions > 0 && loa > 0) {
    const projected = Math.round(interactions * days / loa * 10) / 10;
    document.getElementById('goal-projected').value = projected;
  } else {
    document.getElementById('goal-projected').value = '';
  }

  updateGoalsSummary();
}

function updateGoalsSummary() {
  const interactions = document.getElementById('goal-interactions').value;
  const days = document.getElementById('goal-days').value;
  const loa = document.getElementById('goal-loa').value;
  const projected = document.getElementById('goal-projected').value;
  const focusStep = document.getElementById('growth-focus-step').value;
  const action = document.getElementById('growth-action').value;
  const targetPct = document.getElementById('growth-target-pct').value;

  if (!interactions && !loa) return;

  const box = document.getElementById('goals-summary-box');
  const content = document.getElementById('goals-summary-content');
  box.style.display = 'block';

  let html = '';
  if (interactions) html += `<div class="goal-row"><span>Daily Interaction Target</span><span class="val">${interactions} / day</span></div>`;
  if (days) html += `<div class="goal-row"><span>Days Working</span><span class="val">${days} days</span></div>`;
  if (loa) html += `<div class="goal-row"><span>LOA Target</span><span class="val">1 in ${loa}</span></div>`;
  if (projected) html += `<div class="goal-row"><span>Projected Sign-ups</span><span class="val">${projected} sign-ups</span></div>`;
  if (focusStep) html += `<div class="goal-row"><span>Focus Area</span><span class="val">${focusStep}</span></div>`;
  if (action) html += `<div class="goal-row"><span>My Action</span><span class="val">${action}</span></div>`;
  if (targetPct) html += `<div class="goal-row"><span>Target %</span><span class="val">${targetPct}%</span></div>`;

  content.innerHTML = html;
}

function saveGoals() {
  const goals = {
    interactions: parseFloat(document.getElementById('goal-interactions').value) || 0,
    days: parseFloat(document.getElementById('goal-days').value) || 5,
    loa: parseFloat(document.getElementById('goal-loa').value) || 0,
    projected: parseFloat(document.getElementById('goal-projected').value) || 0,
    focusStep: document.getElementById('growth-focus-step').value,
    currentPct: parseFloat(document.getElementById('growth-current-pct').value) || 0,
    action: document.getElementById('growth-action').value,
    targetPct: parseFloat(document.getElementById('growth-target-pct').value) || 0,
    personal: document.getElementById('growth-personal').value
  };

  state.goals = goals;

  const key = storageKey(state.team, `goals_${state.name}_${state.weekStart}`);
  saveToStorage(key, {
    name: state.name,
    team: state.team,
    weekStart: state.weekStart,
    goals,
    funnelData: state.funnelData,
    avgInteractions: parseFloat(document.getElementById('avg-interactions').value) || 0,
    avgSignups: parseFloat(document.getElementById('avg-signups').value) || 0,
    avgSeen: parseFloat(document.getElementById('avg-seen').value) || 0,
    targetSeen: parseFloat(document.getElementById('target-seen').value) || 0,
    timestamp: new Date().toISOString()
  });

  alert('✅ Goals saved! Head to mid-week check-in on day 3.');
  goStep(3);
}

// ── Step 3: Mid-week ──

function calcMidweekPace() {
  const daysDone = parseFloat(document.getElementById('mw-days').value) || 0;
  const interactions = parseFloat(document.getElementById('mw-interactions').value) || 0;
  const signups = parseFloat(document.getElementById('mw-signups').value) || 0;

  const goalInteractions = state.goals.interactions || 0;
  const goalDays = state.goals.days || 5;
  const goalProjected = state.goals.projected || 0;

  if (!daysDone || !goalInteractions) return;

  document.getElementById('mw-pace-card').style.display = 'block';

  const expectedInteractionsSoFar = goalInteractions * daysDone;
  const wePace = expectedInteractionsSoFar > 0 ? Math.round((interactions / expectedInteractionsSoFar) * 100) : 0;

  const projectedFinalSignups = daysDone > 0 ? Math.round((signups / daysDone) * goalDays * 10) / 10 : 0;
  const salesPace = goalProjected > 0 ? Math.round((projectedFinalSignups / goalProjected) * 100) : 0;

  document.getElementById('mw-we-pace').textContent = `${wePace}%`;
  document.getElementById('mw-sales-pace').textContent = `${salesPace}%`;
  document.getElementById('mw-projected-total').textContent = projectedFinalSignups;
  document.getElementById('mw-we-label').textContent = `${wePace}%`;
  document.getElementById('mw-sales-label').textContent = `${salesPace}%`;
  document.getElementById('mw-we-bar').style.width = `${Math.min(wePace, 100)}%`;
  document.getElementById('mw-sales-bar').style.width = `${Math.min(salesPace, 100)}%`;

  state.midweek = {
    daysDone,
    interactions,
    signups,
    loa: parseFloat(document.getElementById('mw-loa').value) || null,
    wePace,
    salesPace,
    projectedFinalSignups
  };
}

function saveMidweek() {
  calcMidweekPace();
  const midweek = {
    ...state.midweek,
    goingWell: document.getElementById('mw-going-well').value,
    needsFocus: document.getElementById('mw-needs-focus').value,
    timestamp: new Date().toISOString()
  };

  state.midweek = midweek;

  const key = storageKey(state.team, `midweek_${state.name}_${state.weekStart}`);
  saveToStorage(key, {
    name: state.name,
    team: state.team,
    weekStart: state.weekStart,
    goals: state.goals,
    midweek,
    timestamp: new Date().toISOString()
  });

  alert('✅ Mid-week check-in saved!');
  goStep(4);
}

// ── Step 4: Weekly review ──

function populateWeeklyReviewFromMidweek() {
  if (state.midweek && state.midweek.loa) {
    document.getElementById('wr-loa').value = state.midweek.loa;
    document.getElementById('wr-loa-tag').style.display = 'inline';
  }
  if (state.midweek && state.midweek.projectedFinalSignups) {
    document.getElementById('wr-signups').value = state.midweek.projectedFinalSignups;
    document.getElementById('wr-signups-tag').style.display = 'inline';
  }
  calcWeeklyReview();
}

function calcWeeklyReview() {
  const interactions = parseFloat(document.getElementById('wr-interactions').value) || 0;
  const signups = parseFloat(document.getElementById('wr-signups').value) || 0;
  const loa = parseFloat(document.getElementById('wr-loa').value) || 0;
  const days = parseFloat(document.getElementById('wr-days').value) || 5;

  if (!interactions && !signups) return;

  document.getElementById('wr-results-card').style.display = 'block';

  const goalInteractions = state.goals.interactions || 0;
  const goalDays = state.goals.days || 5;
  const goalProjected = state.goals.projected || 0;

  const totalGoalInteractions = goalInteractions * goalDays;
  const wePct = totalGoalInteractions > 0 ? Math.round((interactions / totalGoalInteractions) * 100) : 0;
  const salesPct = goalProjected > 0 ? Math.round((signups / goalProjected) * 100) : 0;
  const actualLoa = interactions > 0 && signups > 0 ? Math.round(interactions / signups) : 0;

  document.getElementById('wr-results-content').innerHTML = `
    <div class="metric-grid">
      <div class="metric-box">
        <div class="val" style="color:${wePct >= 90 ? 'var(--green)' : wePct >= 70 ? 'var(--orange)' : 'var(--red)'}">${wePct}%</div>
        <div class="lbl">WE Goal</div>
      </div>
      <div class="metric-box">
        <div class="val" style="color:${salesPct >= 90 ? 'var(--green)' : salesPct >= 70 ? 'var(--orange)' : 'var(--red)'}">${salesPct}%</div>
        <div class="lbl">Sales Goal</div>
      </div>
      <div class="metric-box">
        <div class="val">${actualLoa > 0 ? '1 in ' + actualLoa : '–'}</div>
        <div class="lbl">Actual LOA</div>
      </div>
    </div>
    <div style="margin-top:12px">
      <div class="goal-row" style="color:white;border-color:rgba(255,255,255,0.15)"><span>Total Interactions</span><span class="val">${interactions} <small style="font-size:12px;opacity:0.6">(goal: ${totalGoalInteractions})</small></span></div>
      <div class="goal-row" style="color:white;border-color:rgba(255,255,255,0.15)"><span>Total Sign-ups</span><span class="val">${signups} <small style="font-size:12px;opacity:0.6">(goal: ${goalProjected})</small></span></div>
      <div class="goal-row" style="color:white;border-color:rgba(255,255,255,0.15)"><span>Days Worked</span><span class="val">${days}</span></div>
    </div>
  `;
}

function saveWeeklyReview() {
  const review = {
    interactions: parseFloat(document.getElementById('wr-interactions').value) || 0,
    signups: parseFloat(document.getElementById('wr-signups').value) || 0,
    loa: parseFloat(document.getElementById('wr-loa').value) || 0,
    days: parseFloat(document.getElementById('wr-days').value) || 5,
    worked: document.getElementById('wr-worked').value,
    different: document.getElementById('wr-different').value,
    timestamp: new Date().toISOString()
  };

  const key = storageKey(state.team, `weekly_${state.name}_${state.weekStart}`);
  saveToStorage(key, {
    name: state.name,
    team: state.team,
    weekStart: state.weekStart,
    goals: state.goals,
    midweek: state.midweek,
    review,
    timestamp: new Date().toISOString()
  });

  alert('🎉 Weekly review submitted! Great work this week.');
}
