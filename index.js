const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/fighters', (req, res) => res.sendFile(path.join(__dirname, 'public', 'fighters.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));

app.get('/api/fighters', async (req, res) => {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/fighters?select=*&order=created_at.desc`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const data = await r.json();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/fighters', async (req, res) => {
  try {
    const { name, espn_id, division, record, nationality } = req.body;
    if (!name || !espn_id) return res.status(400).json({ success: false, error: 'name and espn_id are required' });
    const r = await fetch(`${SUPABASE_URL}/rest/v1/fighters`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({ name, espn_id, division, record, nationality })
    });
    const data = await r.json();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ufc/scoreboard', async (req, res) => {
  try {
    const r = await fetch('https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard');
    const data = await r.json();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ufc/athlete/:id', async (req, res) => {
  try {
    const r = await fetch(`https://sports.core.api.espn.com/v2/sports/mma/leagues/ufc/athletes/${req.params.id}`);
    const data = await r.json();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/fighters/:espn_id', async (req, res) => {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/fighters?espn_id=eq.${req.params.espn_id}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = app;
