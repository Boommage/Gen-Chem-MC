// @vitest-environment node
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { URL } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MAX_MESSAGE_CHARACTERS } from '../../shared/coach.ts'
import { MAX_IMAGE_BYTES, MAX_IMAGE_DIMENSION, MAX_IMAGE_PIXELS } from '../../shared/images.ts'

const migration = readFileSync(new URL('../../migrations/0001_conversations.sql', import.meta.url), 'utf8')
const retentionMigration = readFileSync(new URL('../../migrations/0002_conversation_retention.sql', import.meta.url), 'utf8')
let db: DatabaseSync

function addConversation(id = 'conversation-a', userId = 'student-a') {
  db.prepare('INSERT INTO conversations (id, user_id) VALUES (?, ?)').run(id, userId)
}

function addTurn(conversationId = 'conversation-a', id = 'turn-a', ordinal = 1) {
  db.prepare(`
    INSERT INTO turns (conversation_id, id, ordinal, status, attempt_id, attempt_started_at)
    VALUES (?, ?, ?, 'pending', ?, ?)
  `).run(conversationId, id, ordinal, 'attempt-' + id, '2026-11-20T12:00:00.000Z')
}

function addMessage(id: string, conversationId: string, turnId: string, role = 'user', content = 'What should I identify first?') {
  db.prepare('INSERT INTO messages (id, conversation_id, turn_id, role, content) VALUES (?, ?, ?, ?, ?)')
    .run(id, conversationId, turnId, role, content)
}

function addAttachment(messageId: string, conversationId = 'conversation-a', bytes = 128, width = 10, height = 10, mimeType = 'image/png') {
  db.prepare(`
    INSERT INTO attachments (id, conversation_id, message_id, object_key, mime_type, bytes, width, height)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('attachment-' + messageId, conversationId, messageId, 'private/' + messageId, mimeType, bytes, width, height)
}

beforeEach(() => {
  db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(migration)
  db.exec(retentionMigration)
})

afterEach(() => db.close())

describe('conversation database integrity', () => {
  it('stores a text/image exchange with UTC timestamps and stable request IDs', () => {
    addConversation()
    addTurn()
    addMessage('question-a', 'conversation-a', 'turn-a')
    addAttachment('question-a')
    addMessage('reply-a', 'conversation-a', 'turn-a', 'assistant', 'What information does the problem give you?')
    db.prepare("UPDATE turns SET status = 'completed' WHERE conversation_id = ? AND id = ?")
      .run('conversation-a', 'turn-a')
    const conversation = db.prepare('SELECT * FROM conversations').get()
    expect(conversation?.user_id).toBe('student-a')
    expect(conversation?.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    expect(db.prepare('SELECT COUNT(*) AS count FROM messages').get()?.count).toBe(2)
    expect(db.prepare('PRAGMA foreign_key_check').all()).toEqual([])
  })

  it('permits the same client turn ID in separate conversations', () => {
    addConversation()
    addConversation('conversation-b', 'student-b')
    addTurn()
    addTurn('conversation-b')
    expect(db.prepare('SELECT COUNT(*) AS count FROM turns').get()?.count).toBe(2)
  })

  it('rejects duplicate turn IDs and duplicate turn order within a conversation', () => {
    addConversation()
    addTurn()
    db.prepare("UPDATE turns SET status = 'completed'").run()
    expect(() => addTurn('conversation-a', 'turn-a', 2)).toThrow()
    expect(() => addTurn('conversation-a', 'turn-b', 1)).toThrow()
  })

  it('allows only one pending turn in a conversation', () => {
    addConversation()
    addTurn()
    expect(() => addTurn('conversation-a', 'turn-b', 2)).toThrow()
    db.prepare("UPDATE turns SET status = 'completed'").run()
    expect(() => addTurn('conversation-a', 'turn-b', 2)).not.toThrow()
  })

  it('allows one user message and one assistant reply per turn', () => {
    addConversation()
    addTurn()
    addMessage('question-a', 'conversation-a', 'turn-a')
    expect(() => addMessage('question-b', 'conversation-a', 'turn-a')).toThrow()
    addMessage('reply-a', 'conversation-a', 'turn-a', 'assistant')
    expect(() => addMessage('reply-b', 'conversation-a', 'turn-a', 'assistant')).toThrow()
  })

  it('rejects messages referencing a turn in another conversation', () => {
    addConversation()
    addConversation('conversation-b', 'student-b')
    addTurn()
    expect(() => addMessage('question-b', 'conversation-b', 'turn-a')).toThrow()
  })

  it('rejects an attachment assigned to another conversation or an assistant message', () => {
    addConversation()
    addConversation('conversation-b', 'student-b')
    addTurn()
    addMessage('question-a', 'conversation-a', 'turn-a')
    addMessage('reply-a', 'conversation-a', 'turn-a', 'assistant')
    expect(() => addAttachment('question-a', 'conversation-b')).toThrow()
    expect(() => addAttachment('reply-a')).toThrow()
    addAttachment('question-a')
    expect(() => db.prepare("UPDATE messages SET role = 'assistant' WHERE id = 'question-a'").run()).toThrow()
  })

  it('accepts images at existing byte and dimension limits', () => {
    addConversation()
    addTurn()
    addMessage('question-a', 'conversation-a', 'turn-a')
    expect(() => addAttachment('question-a', 'conversation-a', MAX_IMAGE_BYTES, MAX_IMAGE_DIMENSION, 1)).not.toThrow()
  })

  it.each([
    ['too large', MAX_IMAGE_BYTES + 1, 10, 10, 'image/png'],
    ['too wide', 128, MAX_IMAGE_DIMENSION + 1, 10, 'image/png'],
    ['too many pixels', 128, MAX_IMAGE_DIMENSION, Math.floor(MAX_IMAGE_PIXELS / MAX_IMAGE_DIMENSION) + 1, 'image/png'],
    ['unsupported type', 128, 10, 10, 'image/gif'],
    ['fractional width', 128, 10.5, 10, 'image/png'],
  ])('rejects an image with %s', (_reason, bytes, width, height, mimeType) => {
    addConversation()
    addTurn()
    addMessage('question-a', 'conversation-a', 'turn-a')
    expect(() => addAttachment('question-a', 'conversation-a', bytes as number, width as number, height as number, mimeType as string)).toThrow()
  })

  it('requires failure details only on failed turns', () => {
    addConversation()
    addTurn()
    expect(() => db.prepare("UPDATE turns SET status = 'failed'").run()).toThrow()
    expect(() => db.prepare("UPDATE turns SET error_code = 'TIMEOUT', error_message = 'Please retry.'").run()).toThrow()
    db.prepare("UPDATE turns SET status = 'failed', error_code = 'TIMEOUT', error_message = 'Please retry.'").run()
    expect(db.prepare('SELECT status FROM turns').get()?.status).toBe('failed')
    db.prepare("UPDATE turns SET status = 'pending', error_code = NULL, error_message = NULL, attempt_id = 'retry-a'").run()
  })

  it('rejects missing owners and invalid message roles or lengths', () => {
    expect(() => addConversation('conversation-a', '')).toThrow()
    addConversation()
    addTurn()
    expect(() => addMessage('question-a', 'conversation-a', 'turn-a', 'system')).toThrow()
    expect(() => addMessage('question-a', 'conversation-a', 'turn-a', 'user', '')).toThrow()
    expect(() => addMessage('question-a', 'conversation-a', 'turn-a', 'user', 'x'.repeat(MAX_MESSAGE_CHARACTERS + 1))).toThrow()
  })

  it('rolls back a failed database transaction without leaving partial records', () => {
    addConversation()
    db.exec('BEGIN')
    try {
      addTurn()
      addMessage('question-a', 'conversation-b', 'turn-a')
      db.exec('COMMIT')
    } catch {
      db.exec('ROLLBACK')
    }
    expect(db.prepare('SELECT COUNT(*) AS count FROM turns').get()?.count).toBe(0)
    expect(db.prepare('SELECT COUNT(*) AS count FROM messages').get()?.count).toBe(0)
  })

  it('cascades record deletion within one conversation while preserving another owner', () => {
    addConversation()
    addTurn()
    addMessage('question-a', 'conversation-a', 'turn-a')
    addAttachment('question-a')
    addConversation('conversation-b', 'student-b')
    addTurn('conversation-b')
    addMessage('question-b', 'conversation-b', 'turn-a')
    addAttachment('question-b', 'conversation-b')
    db.prepare('DELETE FROM conversations WHERE id = ? AND user_id = ?').run('conversation-a', 'student-a')
    expect(db.prepare('SELECT conversation_id FROM turns').all()).toEqual([{ conversation_id: 'conversation-b' }])
    expect(db.prepare('SELECT message_id FROM attachments').all()).toEqual([{ message_id: 'question-b' }])
    expect(db.prepare('SELECT object_key FROM image_deletions').all()).toEqual([{ object_key: 'private/question-a' }])
    expect(db.prepare('PRAGMA foreign_key_check').all()).toEqual([])
  })

  it('expires a conversation fourteen days after its latest saved message', () => {
    addConversation()
    addTurn()
    db.prepare(`INSERT INTO messages (id, conversation_id, turn_id, role, content, created_at)
      VALUES ('question-a', 'conversation-a', 'turn-a', 'user', 'Help me start.', '2026-11-20T12:00:00.000Z')`).run()
    expect(db.prepare('SELECT expires_at FROM conversations').get()?.expires_at).toBe('2026-12-04T12:00:00.000Z')
    db.prepare(`INSERT INTO messages (id, conversation_id, turn_id, role, content, created_at)
      VALUES ('reply-a', 'conversation-a', 'turn-a', 'assistant', 'What is given?', '2026-11-20T12:01:00.000Z')`).run()
    expect(db.prepare('SELECT expires_at FROM conversations').get()?.expires_at).toBe('2026-12-04T12:01:00.000Z')
    db.prepare("UPDATE conversations SET title = 'New title'").run()
    db.prepare("UPDATE turns SET status = 'completed'").run()
    expect(db.prepare('SELECT expires_at FROM conversations').get()?.expires_at).toBe('2026-12-04T12:01:00.000Z')
  })

  it('queues images when an expired conversation is removed', () => {
    addConversation()
    addTurn()
    db.prepare(`INSERT INTO messages (id, conversation_id, turn_id, role, content, created_at)
      VALUES ('question-a', 'conversation-a', 'turn-a', 'user', 'Help me start.', '2026-11-01T12:00:00.000Z')`).run()
    addAttachment('question-a')
    addConversation('conversation-b', 'student-b')
    db.prepare('DELETE FROM conversations WHERE expires_at <= ?').run('2026-11-20T12:00:00.000Z')
    expect(db.prepare('SELECT id FROM conversations').all()).toEqual([{ id: 'conversation-b' }])
    expect(db.prepare('SELECT object_key FROM image_deletions').all()).toEqual([{ object_key: 'private/question-a' }])
  })

  it('backfills the latest message when retention is added to existing records', () => {
    const older = new DatabaseSync(':memory:')
    try {
      older.exec('PRAGMA foreign_keys = ON')
      older.exec(migration)
      older.exec(`INSERT INTO conversations (id, user_id, created_at) VALUES ('c', 'u', '2026-11-01T00:00:00.000Z');
        INSERT INTO turns (conversation_id, id, ordinal, status, attempt_id, attempt_started_at)
          VALUES ('c', 't', 1, 'pending', 'a', '2026-11-10T00:00:00.000Z');
        INSERT INTO messages (id, conversation_id, turn_id, role, content, created_at)
          VALUES ('m', 'c', 't', 'user', 'Question', '2026-11-10T00:00:00.000Z');`)
      older.exec(retentionMigration)
      expect(older.prepare('SELECT expires_at FROM conversations').get()?.expires_at).toBe('2026-11-24T00:00:00.000Z')
    } finally {
      older.close()
    }
  })
})
