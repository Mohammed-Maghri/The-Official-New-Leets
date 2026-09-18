-- Optional pre-deployment migration. The authorized admin endpoint also creates
-- this table on first use. Signature profiles do not grant administrative rights.
CREATE TABLE IF NOT EXISTS leets.signature_profiles (
  login TEXT PRIMARY KEY,
  granted_by TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
