// ── Utility functions ──

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Set default week start to next Monday on page load
(function setDefaultWeek() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  const nextMon = new Date(today);
  nextMon.setDate(today.getDate() + (day === 1 ? 0 : diff));
  document.getElementById('fr-week').valueAsDate = nextMon;
})();
