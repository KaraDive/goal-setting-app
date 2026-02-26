// ── localStorage helpers ──

function storageKey(team, type) {
  return `ot_${team.toUpperCase()}_${type}`;
}

function saveToStorage(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) {}
}

function loadFromStorage(key) {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : null;
  } catch(e) { return null; }
}

function getTeamSettings(team) {
  const saved = loadFromStorage(storageKey(team, 'settings'));
  return saved || { steps: DEFAULT_STEPS, pin: '1234' };
}

function saveTeamSettings(team, settings) {
  saveToStorage(storageKey(team, 'settings'), settings);
}
