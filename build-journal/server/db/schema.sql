-- Build Journal database schema
-- Two tables: users (for auth) and sets (each user's LEGO collection).

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sets (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  set_number  TEXT,
  theme       TEXT,
  piece_count INTEGER,
  status      TEXT NOT NULL DEFAULT 'wishlist'
              CHECK (status IN ('owned', 'building', 'wishlist')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Speeds up "show me this user's sets", the most common query.
CREATE INDEX IF NOT EXISTS idx_sets_user_id ON sets(user_id);
