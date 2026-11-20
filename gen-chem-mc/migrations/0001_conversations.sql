-- Supabase Auth owns accounts. conversations.user_id stores its verified subject.
CREATE TABLE conversations (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) > 0),
  user_id TEXT NOT NULL CHECK (length(user_id) > 0),
  title TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX conversations_by_owner_activity
  ON conversations (user_id, updated_at DESC, id DESC);

-- The client turn ID is scoped to its conversation. Each retry gets an attempt ID.
CREATE TABLE turns (
  conversation_id TEXT NOT NULL,
  id TEXT NOT NULL CHECK (length(id) > 0),
  ordinal INTEGER NOT NULL CHECK (typeof(ordinal) = 'integer' AND ordinal > 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  attempt_id TEXT NOT NULL CHECK (length(attempt_id) > 0),
  attempt_started_at TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (conversation_id, id),
  UNIQUE (conversation_id, ordinal),
  FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
  CHECK (
    (status = 'failed' AND error_code IS NOT NULL AND error_message IS NOT NULL
      AND length(error_code) > 0 AND length(error_message) > 0)
    OR (status IN ('pending', 'completed') AND error_code IS NULL AND error_message IS NULL)
  )
);

CREATE UNIQUE INDEX one_pending_turn_per_conversation
  ON turns (conversation_id) WHERE status = 'pending';

CREATE TABLE messages (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) > 0),
  conversation_id TEXT NOT NULL,
  turn_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 2000),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (conversation_id, turn_id, role),
  UNIQUE (id, conversation_id, role),
  FOREIGN KEY (conversation_id, turn_id)
    REFERENCES turns (conversation_id, id) ON DELETE CASCADE
);

-- Image bytes live in private R2. This table stores only their metadata and key.
CREATE TABLE attachments (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) > 0),
  conversation_id TEXT NOT NULL,
  message_id TEXT NOT NULL UNIQUE,
  message_role TEXT NOT NULL DEFAULT 'user' CHECK (message_role = 'user'),
  object_key TEXT NOT NULL UNIQUE CHECK (length(object_key) > 0),
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png')),
  bytes INTEGER NOT NULL CHECK (typeof(bytes) = 'integer' AND bytes > 0 AND bytes <= 2097152),
  width INTEGER NOT NULL CHECK (typeof(width) = 'integer' AND width > 0 AND width <= 4096),
  height INTEGER NOT NULL CHECK (typeof(height) = 'integer' AND height > 0 AND height <= 4096),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (message_id, conversation_id, message_role)
    REFERENCES messages (id, conversation_id, role) ON DELETE CASCADE,
  CHECK (width * height <= 12000000)
);
