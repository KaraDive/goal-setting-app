// ── Login / logout ──

function switchRole(role) {
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('login-fundraiser').style.display = role === 'fundraiser' ? 'block' : 'none';
  document.getElementById('login-manager').style.display = role === 'manager' ? 'block' : 'none';
}

function loginFundraiser() {
  const name = document.getElementById('fr-name').value.trim();
  const team = document.getElementById('fr-team').value.trim().toUpperCase();
  const week = document.getElementById('fr-week').value;

  if (!name || !team || !week) {
    alert('Please fill in your name, team code and week starting date.');
    return;
  }

  state.role = 'fundraiser';
  state.name = name;
  state.team = team;
  state.weekStart = week;
  state.settings = getTeamSettings(team);

  document.getElementById('badge-week').textContent = formatDate(week);
  document.getElementById('fr-badge').innerHTML = `${name} &nbsp;|&nbsp; Week of <span>${formatDate(week)}</span>`;

  buildFunnelTable();
  showScreen('screen-fundraiser');
  goStep(1);
}

function loginManager() {
  const name = document.getElementById('mg-name').value.trim();
  const team = document.getElementById('mg-team').value.trim().toUpperCase();
  const pin = document.getElementById('mg-pin').value;

  if (!name || !team || !pin) {
    alert('Please fill in all fields.');
    return;
  }

  const settings = getTeamSettings(team);
  if (pin !== settings.pin) {
    alert('Incorrect PIN. Please try again.');
    return;
  }

  state.role = 'manager';
  state.name = name;
  state.team = team;
  state.settings = settings;

  document.getElementById('mg-badge-team').textContent = team;

  buildSettingsTable();
  loadManagerDashboard();
  showScreen('screen-manager');
}

function logout() {
  showScreen('screen-login');
  state = { role: null, name: '', team: '', weekStart: '', currentStep: 1, goals: {}, midweek: {}, funnelData: [], biggestGap: null, settings: null };
}
