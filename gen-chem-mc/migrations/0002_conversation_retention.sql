ALTER TABLE conversations ADD COLUMN last_message_at TEXT;
ALTER TABLE conversations ADD COLUMN expires_at TEXT;

UPDATE conversations
SET last_message_at = (
    SELECT MAX(created_at) FROM messages WHERE conversation_id = conversations.id
  ),
  expires_at = strftime('%Y-%m-%dT%H:%M:%fZ', julianday(COALESCE(
    (SELECT MAX(created_at) FROM messages WHERE conversation_id = conversations.id),
    created_at
  )) + 14);

CREATE INDEX conversations_by_expiration ON conversations (expires_at, id);

-- Allocation and first-message insertion will be in the same application batch.
-- A creation-based fallback also expires any abandoned allocation.
CREATE TRIGGER initialize_conversation_expiration
AFTER INSERT ON conversations
BEGIN
  UPDATE conversations
  SET expires_at = strftime('%Y-%m-%dT%H:%M:%fZ', julianday(NEW.created_at) + 14)
  WHERE id = NEW.id;
END;

-- Reading a chat, renaming it, and changing turn status do not renew retention.
CREATE TRIGGER renew_conversation_on_saved_message
AFTER INSERT ON messages
BEGIN
  UPDATE conversations
  SET last_message_at = MAX(COALESCE(last_message_at, NEW.created_at), NEW.created_at),
      updated_at = MAX(updated_at, NEW.created_at),
      expires_at = strftime('%Y-%m-%dT%H:%M:%fZ',
        julianday(MAX(COALESCE(last_message_at, NEW.created_at), NEW.created_at)) + 14)
  WHERE id = NEW.conversation_id;
END;

-- Record file cleanup in the same transaction that removes attachment metadata.
CREATE TABLE image_deletions (
  object_key TEXT PRIMARY KEY NOT NULL,
  queued_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TRIGGER queue_deleted_attachment
AFTER DELETE ON attachments
BEGIN
  INSERT INTO image_deletions (object_key) VALUES (OLD.object_key)
  ON CONFLICT (object_key) DO NOTHING;
END;
