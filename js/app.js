// ── Screen & step navigation ──

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  el.classList.add('active');
  if (id === 'screen-login') el.style.display = 'flex';
}

function goStep(n) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`step-${i}`);
    if (el) el.style.display = i === n ? 'block' : 'none';
  }

  document.querySelectorAll('.step-pill').forEach(p => {
    const s = parseInt(p.dataset.step);
    p.classList.remove('active', 'done');
    if (s === n) p.classList.add('active');
    else if (s < n) p.classList.add('done');
  });

  state.currentStep = n;

  if (n === 2) populateGoalsFromStep1();
  if (n === 4) populateWeeklyReviewFromMidweek();

  window.scrollTo(0, 0);
}
