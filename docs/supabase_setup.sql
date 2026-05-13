

CREATE TABLE fighters (
  id         SERIAL PRIMARY KEY,
  espn_id    TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  division   TEXT,
  record     TEXT,
  nationality TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

