# OT Goal Setting App — v4

**Outcomes Tracking | Goal Setting Dashboard**

> *"What you can track, you can improve."*

A web-based goal setting tool for face-to-face fundraising teams. Built on the Outcomes Tracking Productivity Equation: **Work Ethic + Skill = Results.**

---

## What It Does

Guides fundraisers through a 4-step weekly goal setting process and gives managers a live dashboard to track team performance.

### The 4 Steps
1. **Review Data** — Enter recent stats, funnel conversions, avg seen per day, and auto-detect biggest skill gap
2. **Set Goals** — Productivity goals (interactions + LOA target = projected sign-ups) and growth goals (auto-filled from Step 1)
3. **Mid-Week Check-In** — Track pace vs target, get WE Pace and Sales Pace %
4. **Weekly Review** — Final numbers vs goals, auto-filled from mid-week data

### Manager Portal
- Live dashboard showing all fundraiser mid-week submissions
- Correct WE Pace and Sales Pace calculations (actual vs expected by that point in the week)
- **Custom team settings** — edit funnel step names and standard % ranges
- Settings flow through to all fundraisers on that team code
- PIN-protected access

---

## How To Use

1. Open `OT_Dashboard_v4.html` in any web browser — no install needed
2. **Fundraisers** log in with their name, team code and week start date
3. **Managers** log in with team code + PIN (default PIN: `1234` — change in Team Settings)

---

## Key Features

| Feature | Detail |
|---|---|
| Avg Seen Per Day | Track and set targets on the Review Data page |
| Auto-fill Biggest Gap | Detects worst funnel step automatically |
| Auto-fill Focus Step | Flows from Step 1 into Set Goals |
| Auto-fill Weekly Review | LOA and sign-ups pre-fill from mid-week data |
| Mid-Week Pace Fix | Calculates pace correctly vs expected progress, not full week target |
| Custom Funnel Steps | Manager can rename steps and set standards per team |
| Data Persistence | Uses browser localStorage — data saves between sessions |

---

## Files

```
OT_Dashboard_v4.html    — The full app (single file, no dependencies)
README.md               — This file
```

---

## Built With

- Plain HTML, CSS, JavaScript — no frameworks, no installs
- Works on desktop and mobile browsers
- Data stored locally in the browser (localStorage)

---

## Roadmap

- [ ] Pull funnel standards direct from OT app data
- [ ] Avg seen per day auto-populated from app
- [ ] Multi-week history and trend view
- [ ] Export weekly review to PDF

---

*Outcomes Tracking — Input = Output.*
