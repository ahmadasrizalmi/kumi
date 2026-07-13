-- Kumi Database Schema for Cloudflare D1

CREATE TABLE IF NOT EXISTS scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_keyword TEXT NOT NULL,
    script_json TEXT NOT NULL,
    audio_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for cache lookups
CREATE INDEX IF NOT EXISTS idx_topic ON scenarios(topic_keyword);
CREATE INDEX IF NOT EXISTS idx_created ON scenarios(created_at);
