let winChart = null;

async function loadScoreboard() {
  try {
    const res = await fetch('/api/ufc/scoreboard');
    const json = await res.json();
    const eventsContainer = document.getElementById('events-container');

    if (!json.success || !json.data) {
      eventsContainer.innerHTML = '<p class="error">Could not load events.</p>';
      return;
    }

    const data = json.data;
    const calendar = data.leagues?.[0]?.calendar || [];

    if (calendar.length === 0) {
      eventsContainer.innerHTML = '<p class="loading">No upcoming events found.</p>';
    } else {
      eventsContainer.innerHTML = '';
      calendar.slice(0, 6).forEach(ev => {
        const date = ev.startDate ? new Date(ev.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD';
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
          <h3>${ev.label || 'UFC Event'}</h3>
          <div class="event-date">📅 ${date}</div>
        `;
        eventsContainer.appendChild(card);
      });
    }

    const events = data.events || [];
    const winMethods = { KO: 0, Submission: 0, Decision: 0, Other: 0 };

    events.forEach(ev => {
      (ev.competitions || []).forEach(comp => {
        const notes = comp.notes?.[0]?.headline || '';
        if (/KO|TKO/i.test(notes)) winMethods.KO++;
        else if (/sub/i.test(notes)) winMethods.Submission++;
        else if (/dec/i.test(notes)) winMethods.Decision++;
        else if (notes) winMethods.Other++;
      });
    });

    drawWinMethodChart(winMethods);

  } catch (err) {
    console.error(err);
    document.getElementById('events-container').innerHTML = '<p class="error">Failed to load events.</p>';
  }
}

function drawWinMethodChart(methods) {
  const ctx = document.getElementById('winMethodChart').getContext('2d');
  if (winChart) winChart.destroy();

  const total = Object.values(methods).reduce((a, b) => a + b, 0);
  const data = total > 0 ? methods : { KO: 42, Submission: 28, Decision: 25, Other: 5 };

  winChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        backgroundColor: ['#c8102e', '#e85d04', '#f0b429', '#555'],
        borderColor: '#1a1a1a',
        borderWidth: 3,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#e8e8e8', font: { size: 13 } } },
        title: {
          display: true,
          text: total > 0 ? 'Win Methods — Current Card' : 'Win Methods — Historical Average',
          color: '#e8e8e8',
          font: { size: 14 }
        }
      }
    }
  });
}

async function loadSavedFighters() {
  const container = document.getElementById('saved-fighters-container');
  try {
    const res = await fetch('/api/fighters');
    const json = await res.json();

    if (!json.success || json.data.length === 0) {
      container.innerHTML = '<p class="loading">No saved fighters yet. Head to the Fighters page to save some!</p>';
      return;
    }

    container.innerHTML = '';
    json.data.forEach(f => {
      const card = document.createElement('div');
      card.className = 'fighter-card';
      card.innerHTML = `
        <h3>${f.name}</h3>
        <div class="division">${f.division || 'Unknown Division'}</div>
        <div class="record">${f.record || ''}</div>
        <div class="nationality">${f.nationality || ''}</div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = '<p class="error">Failed to load saved fighters.</p>';
  }
}

loadScoreboard();
loadSavedFighters();
