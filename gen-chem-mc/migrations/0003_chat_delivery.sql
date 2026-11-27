-- Stable input fingerprints prevent retrying an ID with different text/images.
ALTER TABLE turns ADD COLUMN input_hash TEXT CHECK (input_hash IS NULL OR length(input_hash) = 64);

-- Conservative lifetime counters: never reset automatically or refund uncertain
-- operations. Initialize only for a new dedicated bucket with no prior usage.
CREATE TABLE r2_usage (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  upload_bytes INTEGER NOT NULL DEFAULT 0 CHECK (upload_bytes >= 0),
  class_a INTEGER NOT NULL DEFAULT 0 CHECK (class_a >= 0),
  class_b INTEGER NOT NULL DEFAULT 0 CHECK (class_b >= 0)
);
INSERT INTO r2_usage (id) VALUES (1);

CREATE TABLE image_objects (
  object_key TEXT PRIMARY KEY,
  bytes INTEGER NOT NULL CHECK (bytes > 0),
  state TEXT NOT NULL CHECK (state IN ('reserved', 'stored')),
  created_at TEXT NOT NULL
);

CREATE TABLE image_rate_limits (
  user_id TEXT NOT NULL,
  day TEXT NOT NULL,
  uploads INTEGER NOT NULL DEFAULT 0,
  reads INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
