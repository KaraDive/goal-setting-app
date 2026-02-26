// ── Global app state ──
let state = {
  role: null,
  name: '',
  team: '',
  weekStart: '',
  currentStep: 1,
  goals: {},
  midweek: {},
  funnelData: [],
  biggestGap: null,
  settings: null
};

// ── Default funnel steps (overridden by manager settings) ──
const DEFAULT_STEPS = [
  { name: 'Approached → Stopped',   standardMin: 60, standardMax: 80 },
  { name: 'Stopped → Pitched',      standardMin: 70, standardMax: 85 },
  { name: 'Pitched → Interested',   standardMin: 30, standardMax: 50 },
  { name: 'Interested → Qualified', standardMin: 60, standardMax: 80 },
  { name: 'Qualified → Sign-up',    standardMin: 40, standardMax: 60 },
];
