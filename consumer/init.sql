CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  session_id TEXT,
  event TEXT,
  url TEXT,
  timestamp TIMESTAMP,
  browser TEXT,
  platform TEXT,
  ip_address TEXT,
  user_agent TEXT
);
