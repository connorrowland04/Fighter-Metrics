

let currentFighter = null;
let statsChart = null;


async function searchFighter(id) {
  if (!id) return;
  id = id.trim();

  const profileSection = document.getElementById('profile-section');
  const profileCard = document.getElementById('fighter-profile');
  const saveBtn = document.getElementById('save-btn');
  const chartWrapper = document.getElementById('stats-chart-wrapper');

  profileSection.style.display = 'block';
  profileCard.innerHTML = '<p class="loading">Loading fighter...</p>';
  saveBtn.style.display = 'none';
  chartWrapper.style.display = 'none';

  try {
    const res = await fetch(`/api/ufc/athlete/${id}`);
    const json = await res.json();

    if (!json.success || !json.data) {
      profileCard.innerHTML = '<p class="error">Fighter not found. Try a different ESPN athlete ID.</p>';
      return;
    }

    const d = json.data;
    const name = d.fullName || d.displayName || 'Unknown';
    const position = d.position?.displayName || d.position?.name || '';
    const birthplace = d.birthPlace?.city ? `${d.birthPlace.city}, ${d.birthPlace.country?.displayName || ''}` : '';
    const height = d.displayHeight || '';
    const weight = d.displayWeight || '';
    const age = d.age || '';
    const record = d.record?.displayValue || d.wins !== undefined ? `${d.wins || 0}-${d.losses || 0}-${d.draws || 0}` : '';
    const nationality = d.citizenship || d.birthPlace?.country?.displayName || '';

    currentFighter = { name, espn_id: id, division: position, record, nationality };

    profileCard.innerHTML = `
      <h2>${name}</h2>
      <div class="profile-division">${position || 'UFC Fighter'}</div>
      <div class="profile-stats">
        ${record ? `<div class="profile-stat"><div class="label">Record</div><div class="value">${record}</div></div>` : ''}
        ${height ? `<div class="profile-stat"><div class="label">Height</div><div class="value">${height}</div></div>` : ''}
        ${weight ? `<div class="profile-stat"><div class="label">Weight</div><div class="value">${weight}</div></div>` : ''}
        ${age ? `<div class="profile-stat"><div class="label">Age</div><div class="value">${age}</div></div>` : ''}
        ${birthplace ? `<div class="profile-stat"><div class="label">From</div><div class="value">${birthplace}</div></div>` : ''}
        ${nationality ? `<div class="profile-stat"><div class="label">Nationality</div><div class="value">${nationality}</div></div>` : ''}
      </div>
    `;

 
    if (d.wins !== undefined) {
      chartWrapper.style.display = 'block';
      drawStatsChart(d.wins || 0, d.losses || 0, d.draws || 0);
    }

    saveBtn.style.display = 'block';

  } catch (err) {
    profileCard.innerHTML = '<p class="error">Error loading fighter. Check the athlete ID and try again.</p>';
    console.error(err);
  }
}

function drawStatsChart(wins, losses, draws) {
  const ctx = document.getElementById('fighterStatsChart').getContext('2d');
  if (statsChart) statsChart.destroy();

  statsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Wins', 'Losses', 'Draws'],
      datasets: [{
        label: 'Fight Record',
        data: [wins, losses, draws],
        backgroundColor: ['#c8102e', '#555', '#f0b429'],
        borderColor: '#1a1a1a',
        borderWidth: 2,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Fight Record',
          color: '#e8e8e8',
          font: { size: 14 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#888', stepSize: 1 },
          grid: { color: '#333' }
        },
        x: {
          ticks: { color: '#888' },
          grid: { color: '#333' }
        }
      }
    }
  });
}


async function saveFighter() {
  if (!currentFighter) return;

  try {
    const res = await fetch('/api/fighters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentFighter)
    });
    const json = await res.json();

    if (json.success) {
      document.getElementById('save-btn').textContent = '✅ Saved!';
      setTimeout(() => {
        document.getElementById('save-btn').textContent = '⭐ Save Fighter';
      }, 2000);
      loadSavedFighters();
    } else {
      alert('Error saving fighter: ' + json.error);
    }
  } catch (err) {
    console.error(err);
  }
}


async function loadCardFighters() {
  const container = document.getElementById('card-fighters');
  try {
    const res = await fetch('/api/ufc/scoreboard');
    const json = await res.json();

    if (!json.success || !json.data?.events?.length) {
      container.innerHTML = '<p class="loading">No active card found right now.</p>';
      return;
    }

    const fighters = [];
    json.data.events.forEach(ev => {
      (ev.competitions || []).forEach(comp => {
        (comp.competitors || []).forEach(c => {
          const name = c.athlete?.displayName || c.team?.displayName;
          const id = c.athlete?.id;
          if (name) fighters.push({ name, id, division: comp.type?.text || '' });
        });
      });
    });

    if (fighters.length === 0) {
      container.innerHTML = '<p class="loading">No fighters on the current card.</p>';
      return;
    }

    container.innerHTML = '';
    fighters.forEach(f => {
      const card = document.createElement('div');
      card.className = 'fighter-card';
      card.innerHTML = `
        <h3>${f.name}</h3>
        <div class="division">${f.division}</div>
        ${f.id ? `<div class="record" style="font-size:0.75rem;color:#555;margin-top:0.3rem;">ID: ${f.id}</div>` : ''}
      `;
      if (f.id) {
        card.addEventListener('click', () => {
          document.getElementById('fighter-search').value = f.id;
          searchFighter(f.id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
      container.appendChild(card);
    });

  } catch (err) {
    container.innerHTML = '<p class="error">Failed to load card fighters.</p>';
  }
}


async function loadSavedFighters() {
  const container = document.getElementById('saved-list');
  try {
    const res = await fetch('/api/fighters');
    const json = await res.json();

    if (!json.success || json.data.length === 0) {
      container.innerHTML = '<p class="loading">No saved fighters yet.</p>';
      return;
    }

    container.innerHTML = '';
    json.data.forEach(f => {
      const card = document.createElement('div');
      card.className = 'fighter-card';
      card.innerHTML = `
        <h3>${f.name}</h3>
        <div class="division">${f.division || ''}</div>
        <div class="record">${f.record || ''}</div>
        <div class="nationality">${f.nationality || ''}</div>
        <button class="delete-btn" data-id="${f.espn_id}">🗑 Remove</button>
      `;
      card.querySelector('.delete-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        await deleteFighter(f.espn_id);
      });
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = '<p class="error">Failed to load saved fighters.</p>';
  }
}

async function deleteFighter(espn_id) {
  try {
    const res = await fetch(`/api/fighters/${espn_id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) loadSavedFighters();
  } catch (err) {
    console.error(err);
  }
}


document.getElementById('search-btn').addEventListener('click', () => {
  searchFighter(document.getElementById('fighter-search').value);
});

document.getElementById('fighter-search').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchFighter(e.target.value);
});

document.getElementById('save-btn').addEventListener('click', saveFighter);

document.querySelectorAll('.id-hint').forEach(el => {
  el.addEventListener('click', () => {
    const id = el.dataset.id;
    document.getElementById('fighter-search').value = id;
    searchFighter(id);
  });
});


loadCardFighters();
loadSavedFighters();
