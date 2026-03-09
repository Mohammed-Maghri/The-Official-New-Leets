-- Blocked logins (test/staff accounts) - cached from 42 API, refreshed monthly
CREATE TABLE IF NOT EXISTS leets.blocked_logins (
    login TEXT PRIMARY KEY,
    source TEXT NOT NULL CHECK (source IN ('test', 'staff')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Metadata: when was the cache last refreshed from 42 API (single row)
CREATE TABLE IF NOT EXISTS leets.blocked_logins_meta (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    last_refreshed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure we have exactly one metadata row (1970 = never refreshed, will trigger first fetch)
INSERT INTO leets.blocked_logins_meta (id, last_refreshed_at)
VALUES (1, '1970-01-01'::timestamp)
ON CONFLICT (id) DO NOTHING;

-- Index for fast lookups (login is PK, so already indexed)
CREATE INDEX IF NOT EXISTS idx_blocked_logins_source ON leets.blocked_logins(source);
