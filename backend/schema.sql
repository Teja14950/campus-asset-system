-- ─────────────────────────────────────────────────────────────────────────────
-- AssetTrack — Complete Database Schema
-- Run this on a fresh PostgreSQL database to set up the entire system
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'reporter' CHECK (role IN ('reporter', 'repairer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Allowed email domains (admin-configurable)
CREATE TABLE IF NOT EXISTS allowed_domains (
  id         SERIAL PRIMARY KEY,
  domain     TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO allowed_domains (domain) VALUES ('iitg.ac.in') ON CONFLICT DO NOTHING;

-- 3. Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  building  TEXT NOT NULL,
  block     TEXT,
  floor     TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Assets
CREATE TABLE IF NOT EXISTS assets (
  id         SERIAL PRIMARY KEY,
  room_id    INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('fan','light','tap','projector','ac','door','window','other')),
  status     TEXT NOT NULL DEFAULT 'working' CHECK (status IN ('working','pending','under_repair')),
  x_position INTEGER,
  y_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Reports
CREATE TABLE IF NOT EXISTS reports (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  asset_id    INTEGER NOT NULL REFERENCES assets(id),
  assigned_to INTEGER REFERENCES users(id),
  description TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','assigned','resolved')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 6. Role requests
CREATE TABLE IF NOT EXISTS role_requests (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_role TEXT NOT NULL DEFAULT 'repairer',
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at    TIMESTAMPTZ,
  UNIQUE(user_id, requested_role)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_room_id   ON assets(room_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id  ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_asset_id ON reports(asset_id);
CREATE INDEX IF NOT EXISTS idx_reports_assigned ON reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reports_status   ON reports(status);
CREATE INDEX IF NOT EXISTS idx_role_req_status  ON role_requests(status);

-- Seed admin (password: admin123 — change after first login)
INSERT INTO users (name, email, password, role)
VALUES ('Admin','admin@iitg.ac.in','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uSccQ/Wm','admin')
ON CONFLICT DO NOTHING;