-- Fighter Metrics — Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor before starting the app

CREATE TABLE fighters (
  id         SERIAL PRIMARY KEY,
  espn_id    TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  division   TEXT,
  record     TEXT,
  nationality TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: enable Row Level Security (recommended for production)
-- ALTER TABLE fighters ENABLE ROW LEVEL SECURITY;
