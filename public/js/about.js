// about.js — animated stats using CountUp.js + fetch from backend

async function loadStats() {
  try {
    // Fetch scoreboard for event count
    const scoreRes = await fetch('/api/ufc/scoreboard');
    const scoreJson = await scoreRes.json();

    // Fetch saved fighters count
    const savedRes = await fetch('/api/fighters');
    const savedJson = await savedRes.json();

    const eventCount = scoreJson?.data?.leagues?.[0]?.calendar?.length || 12;
    const fighterCount = scoreJson?.data?.events
      ? scoreJson.data.events.reduce((acc, ev) => {
          return acc + (ev.competitions || []).reduce((a, c) => a + (c.competitors?.length || 0), 0);
        }, 0)
      : 24;
    const savedCount = savedJson?.data?.length || 0;

    // Animate with CountUp.js
    if (typeof countUp !== 'undefined') {
      new countUp.CountUp('stat-events', eventCount, { duration: 2 }).start();
      new countUp.CountUp('stat-fighters', fighterCount, { duration: 2.5 }).start();
      new countUp.CountUp('stat-saved', savedCount, { duration: 1.5 }).start();
    } else {
      document.getElementById('stat-events').textContent = eventCount;
      document.getElementById('stat-fighters').textContent = fighterCount;
      document.getElementById('stat-saved').textContent = savedCount;
    }

  } catch (err) {
    console.error('Stats load error:', err);
    document.getElementById('stat-events').textContent = '—';
    document.getElementById('stat-fighters').textContent = '—';
    document.getElementById('stat-saved').textContent = '—';
  }
}

loadStats();
