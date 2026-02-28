/**
 * Tests for goal-setting-app
 * Tests cover: pure utilities, storage helpers, calculation logic
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── helpers ────────────────────────────────────────────────────────────────

function readJS(file) {
  return fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8');
}

const APP_HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const APP_SCRIPTS = ['state.js', 'storage.js', 'app.js', 'fundraiser.js', 'manager.js', 'auth.js', 'utils.js']
  .map(readJS).join('\n')
  // Expose the `let state` variable (not a window property) as a getter so tests can inspect it
  + '\nObject.defineProperty(window, "_appState", { get: () => state, configurable: true });';

/**
 * Reset the DOM to the initial HTML.
 * App scripts are injected only ONCE (they share one lexical scope so
 * let/const from state.js are visible inside all other functions).
 */
function loadApp() {
  document.documentElement.innerHTML = APP_HTML;
  global.alert = jest.fn();

  if (!window.__appLoaded) {
    const el = document.createElement('script');
    el.textContent = APP_SCRIPTS;
    document.head.appendChild(el);
    window.__appLoaded = true;
  }
}

// ─── formatDate ─────────────────────────────────────────────────────────────

describe('formatDate', () => {
  beforeAll(loadApp);

  test('formats a valid ISO date string to AU locale', () => {
    expect(formatDate('2026-03-02')).toBe('2 Mar 2026');
  });

  test('returns empty string for falsy input', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });
});

// ─── storageKey ─────────────────────────────────────────────────────────────

describe('storageKey', () => {
  beforeAll(loadApp);

  test('produces expected key format', () => {
    expect(storageKey('team01', 'settings')).toBe('ot_TEAM01_settings');
  });

  test('uppercases the team code', () => {
    expect(storageKey('abc', 'goals_Alex_2026-03-02')).toBe('ot_ABC_goals_Alex_2026-03-02');
  });
});

// ─── getTeamSettings ────────────────────────────────────────────────────────

describe('getTeamSettings', () => {
  beforeEach(() => {
    loadApp();
    localStorage.clear();
  });

  test('returns default settings (5 funnel steps, PIN 1234) when nothing stored', () => {
    const settings = getTeamSettings('NEWTEAM');
    expect(settings.pin).toBe('1234');
    expect(settings.steps).toHaveLength(5);
  });

  test('returns stored settings when available', () => {
    const custom = { steps: [{ name: 'Step A', standardMin: 50, standardMax: 70 }], pin: '9999' };
    localStorage.setItem('ot_MYTEAM_settings', JSON.stringify(custom));
    const result = getTeamSettings('MYTEAM');
    expect(result.pin).toBe('9999');
    expect(result.steps[0].name).toBe('Step A');
  });
});

// ─── calcProjected formula ──────────────────────────────────────────────────

describe('calcProjected formula', () => {
  // projected = Math.round(interactions * days / loa * 10) / 10
  const projected = (interactions, days, loa) =>
    Math.round(interactions * days / loa * 10) / 10;

  test('50 interactions × 5 days ÷ 18 LOA ≈ 13.9', () => {
    expect(projected(50, 5, 18)).toBeCloseTo(13.9, 1);
  });

  test('40 interactions × 5 days ÷ 20 LOA = 10', () => {
    expect(projected(40, 5, 20)).toBe(10);
  });

  test('30 interactions × 4 days ÷ 15 LOA = 8', () => {
    expect(projected(30, 4, 15)).toBe(8);
  });
});

// ─── calcMidweekPace formulas ────────────────────────────────────────────────

describe('calcMidweekPace formulas', () => {
  const wePace = (interactions, goalInteractions, daysDone) =>
    goalInteractions * daysDone > 0
      ? Math.round((interactions / (goalInteractions * daysDone)) * 100)
      : 0;

  const projectedFinalSignups = (signups, daysDone, goalDays) =>
    daysDone > 0 ? Math.round((signups / daysDone) * goalDays * 10) / 10 : 0;

  const salesPace = (projectedFinal, goalProjected) =>
    goalProjected > 0 ? Math.round((projectedFinal / goalProjected) * 100) : 0;

  test('WE pace: on track = 100%', () => {
    expect(wePace(150, 50, 3)).toBe(100);
  });

  test('WE pace: behind = 80%', () => {
    expect(wePace(120, 50, 3)).toBe(80);
  });

  test('WE pace: ahead = 120%', () => {
    expect(wePace(180, 50, 3)).toBe(120);
  });

  test('projected final signups extrapolates correctly', () => {
    // 6 signups in 3 days → 10 total in 5 days
    expect(projectedFinalSignups(6, 3, 5)).toBe(10);
  });

  test('sales pace: hitting goal = 100%', () => {
    expect(salesPace(10, 10)).toBe(100);
  });

  test('sales pace: below goal = 80%', () => {
    expect(salesPace(8, 10)).toBe(80);
  });

  test('sales pace: zero goal returns 0', () => {
    expect(salesPace(5, 0)).toBe(0);
  });
});

// ─── calcWeeklyReview formulas ───────────────────────────────────────────────

describe('calcWeeklyReview formulas', () => {
  const wePct = (interactions, goalInteractions, goalDays) => {
    const totalGoal = goalInteractions * goalDays;
    return totalGoal > 0 ? Math.round((interactions / totalGoal) * 100) : 0;
  };

  const salesPct = (signups, goalProjected) =>
    goalProjected > 0 ? Math.round((signups / goalProjected) * 100) : 0;

  const actualLoa = (interactions, signups) =>
    interactions > 0 && signups > 0 ? Math.round(interactions / signups) : 0;

  test('WE %: 230 of 250 target = 92%', () => {
    expect(wePct(230, 50, 5)).toBe(92);
  });

  test('Sales %: 12 signups vs 10 goal = 120%', () => {
    expect(salesPct(12, 10)).toBe(120);
  });

  test('Sales %: zero goal returns 0', () => {
    expect(salesPct(12, 0)).toBe(0);
  });

  test('Actual LOA: 200 interactions / 10 signups = 1 in 20', () => {
    expect(actualLoa(200, 10)).toBe(20);
  });

  test('Actual LOA: zero signups returns 0', () => {
    expect(actualLoa(200, 0)).toBe(0);
  });
});

// ─── Gap detection formula ───────────────────────────────────────────────────

describe('Gap detection formula', () => {
  const gapPct = (standardMin, standardMax, myPct) =>
    Math.round((standardMin + standardMax) / 2 - myPct);

  test('below standard → positive gap', () => {
    // standard 60-80%, user at 50% → midpoint 70 → gap 20
    expect(gapPct(60, 80, 50)).toBe(20);
  });

  test('above standard → negative gap', () => {
    expect(gapPct(60, 80, 85)).toBe(-15);
  });

  test('at midpoint → zero gap', () => {
    expect(gapPct(60, 80, 70)).toBe(0);
  });

  test('correctly identifies worst gap across multiple steps', () => {
    const steps = [
      { standardMin: 60, standardMax: 80, myPct: 50 }, // gap 20  ← worst
      { standardMin: 70, standardMax: 85, myPct: 70 }, // gap ~8
      { standardMin: 30, standardMax: 50, myPct: 38 }, // gap 2
    ];
    const gaps = steps.map(s => gapPct(s.standardMin, s.standardMax, s.myPct));
    const worstIndex = gaps.indexOf(Math.max(...gaps));
    expect(worstIndex).toBe(0);
  });
});

// ─── loginFundraiser validation (DOM-integrated) ─────────────────────────────

describe('loginFundraiser validation', () => {
  beforeEach(() => {
    loadApp();
    global.alert = jest.fn();
  });

  test('shows alert when fields are empty', () => {
    loginFundraiser();
    expect(alert).toHaveBeenCalledWith(expect.stringMatching(/name|team|date/i));
  });

  test('navigates to fundraiser screen when fields are filled', () => {
    document.getElementById('fr-name').value = 'Alex';
    document.getElementById('fr-team').value = 'TEAM01';
    document.getElementById('fr-week').value  = '2026-03-02';
    loginFundraiser();
    expect(document.getElementById('screen-fundraiser').classList.contains('active')).toBe(true);
  });
});

// ─── loginManager validation (DOM-integrated) ────────────────────────────────

describe('loginManager validation', () => {
  beforeEach(() => {
    loadApp();
    global.alert = jest.fn();
    localStorage.clear();
  });

  test('shows alert when fields are empty', () => {
    loginManager();
    expect(alert).toHaveBeenCalled();
  });

  test('shows alert on wrong PIN', () => {
    document.getElementById('mg-name').value = 'Jordan';
    document.getElementById('mg-team').value = 'TEAM01';
    document.getElementById('mg-pin').value  = '9999';
    loginManager();
    expect(alert).toHaveBeenCalledWith(expect.stringMatching(/incorrect pin/i));
  });

  test('navigates to manager screen on correct default PIN (1234)', () => {
    document.getElementById('mg-name').value = 'Jordan';
    document.getElementById('mg-team').value = 'TEAM01';
    document.getElementById('mg-pin').value  = '1234';
    loginManager();
    expect(document.getElementById('screen-manager').classList.contains('active')).toBe(true);
  });
});

// ─── logout ──────────────────────────────────────────────────────────────────

describe('logout', () => {
  beforeEach(() => {
    loadApp();
    global.alert = jest.fn();
    // Login first
    document.getElementById('fr-name').value = 'Alex';
    document.getElementById('fr-team').value = 'TEAM01';
    document.getElementById('fr-week').value  = '2026-03-02';
    loginFundraiser();
  });

  test('returns to login screen', () => {
    logout();
    expect(document.getElementById('screen-login').classList.contains('active')).toBe(true);
  });

  test('resets state', () => {
    logout();
    expect(window._appState.role).toBeNull();
    expect(window._appState.name).toBe('');
  });
});
