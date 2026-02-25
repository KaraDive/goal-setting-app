// ── Manager: settings table ──

function buildSettingsTable() {
  const steps = state.settings.steps;
  const tbody = document.getElementById('settings-body');
  tbody.innerHTML = '';

  steps.forEach((step, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--muted);font-weight:700">${i + 1}</td>
      <td><input type="text" id="set-name-${i}" value="${step.name}"></td>
      <td><input type="number" id="set-min-${i}" value="${step.standardMin}" style="width:80px"></td>
      <td><input type="number" id="set-max-${i}" value="${step.standardMax}" style="width:80px"></td>
    `;
    tbody.appendChild(tr);
  });
}

function saveSettings() {
  const steps = state.settings.steps.map((s, i) => ({
    name: document.getElementById(`set-name-${i}`).value || s.name,
    standardMin: parseFloat(document.getElementById(`set-min-${i}`).value) || s.standardMin,
    standardMax: parseFloat(document.getElementById(`set-max-${i}`).value) || s.standardMax
  }));

  state.settings.steps = steps;
  saveTeamSettings(state.team, state.settings);

  const btn = event.target;
  const orig = btn.textContent;
  btn.textContent = '✅ SAVED!';
  setTimeout(() => btn.textContent = orig, 2000);
}

function savePIN() {
  const newPin = document.getElementById('new-pin').value;
  const confirmPin = document.getElementById('confirm-pin').value;

  if (newPin.length !== 4 || isNaN(newPin)) {
    alert('PIN must be exactly 4 digits.'); return;
  }
  if (newPin !== confirmPin) {
    alert('PINs do not match.'); return;
  }

  state.settings.pin = newPin;
  saveTeamSettings(state.team, state.settings);
  alert('✅ PIN updated!');
  document.getElementById('new-pin').value = '';
  document.getElementById('confirm-pin').value = '';
}

// ── Manager: dashboard ──

function loadManagerDashboard() {
  const team = state.team;
  const grid = document.getElementById('manager-grid');
  let submissions = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`ot_${team}_midweek_`)) {
        const data = loadFromStorage(key);
        if (data) submissions.push(data);
      }
    }
  } catch(e) {}

  document.getElementById('mg-total-fundraisers').textContent = submissions.length;

  if (submissions.length === 0) {
    grid.innerHTML = '<div class="alert alert-info">No mid-week data submitted yet.</div>';
    document.getElementById('mg-avg-we-pace').textContent = '–';
    document.getElementById('mg-avg-sales-pace').textContent = '–';
    return;
  }

  let totalWe = 0, totalSales = 0, count = 0;
  submissions.forEach(s => {
    if (s.midweek && s.midweek.wePace) { totalWe += s.midweek.wePace; count++; }
    if (s.midweek && s.midweek.salesPace) totalSales += s.midweek.salesPace;
  });

  const avgWe = count > 0 ? Math.round(totalWe / count) : 0;
  const avgSales = count > 0 ? Math.round(totalSales / count) : 0;
  document.getElementById('mg-avg-we-pace').textContent = `${avgWe}%`;
  document.getElementById('mg-avg-sales-pace').textContent = `${avgSales}%`;

  grid.innerHTML = submissions.map(s => {
    const mw = s.midweek || {};
    const g = s.goals || {};
    const daysDone = mw.daysDone || 0;
    const interactions = mw.interactions || 0;
    const signups = mw.signups || 0;
    const goalInteractions = g.interactions || 0;
    const goalDays = g.days || 5;
    const goalProjected = g.projected || 0;

    const expectedSoFar = goalInteractions * daysDone;
    const wePace = expectedSoFar > 0 ? Math.round((interactions / expectedSoFar) * 100) : 0;
    const projectedFinal = daysDone > 0 ? (signups / daysDone) * goalDays : 0;
    const salesPace = goalProjected > 0 ? Math.round((projectedFinal / goalProjected) * 100) : 0;

    const wePaceClass = wePace >= 90 ? 'pace-good' : wePace >= 70 ? 'pace-warn' : 'pace-bad';
    const salesPaceClass = salesPace >= 90 ? 'pace-good' : salesPace >= 70 ? 'pace-warn' : 'pace-bad';

    return `
      <div class="fundraiser-card">
        <div class="name">${s.name}</div>
        <div class="stat">Week: <strong>${s.weekStart || '–'}</strong></div>
        <div class="stat">Interactions: <strong>${interactions}</strong></div>
        <div class="stat">Sign-ups: <strong>${signups}</strong></div>
        <div class="stat">WE Pace: <strong class="${wePaceClass}">${wePace}%</strong></div>
        <div class="stat">Sales Pace: <strong class="${salesPaceClass}">${salesPace}%</strong></div>
        <div class="stat" style="font-size:11px;color:var(--muted);margin-top:6px">${mw.goingWell ? '💬 ' + mw.goingWell.substring(0,40) + '...' : ''}</div>
      </div>
    `;
  }).join('');
}

// ── Manager: tab switching ──

function mgTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById(`tab-${name}`).classList.add('active');

  if (name === 'dashboard') loadManagerDashboard();
}
