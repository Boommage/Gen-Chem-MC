import type { ConversationSummary, SavedMessage, ConversationPage, MessagePage, TurnResult, TurnStatus } from '../../shared/conversations.ts'
import { ConversationError, notFound } from './errors.ts'
import { cursor, encodeCursor } from './validation.ts'

interface ConversationRow {
  id: string; title: string; created_at: string; updated_at: string
}
interface MessageRow {
  id: string; conversation_id: string; turn_id: string; role: 'user' | 'assistant'; content: string; created_at: string
  ordinal: number; rank: number; status: TurnStatus; error_code: string | null; error_message: string | null
  attachment_id: string | null; mime_type: 'image/png' | 'image/jpeg'; width: number; height: number; bytes: number; object_key: string | null
}
export interface TurnRow {
  id: string; status: TurnStatus; input_hash: string | null; attempt_id: string; ordinal: number
}
export interface StoredAttachment {
  id: string; object_key: string; mime_type: 'image/png' | 'image/jpeg'; width: number; height: number; bytes: number
}
const messageSQL = `SELECT m.*, t.ordinal, CASE m.role WHEN 'user' THEN 0 ELSE 1 END AS rank,
  t.status, t.error_code, t.error_message, a.id AS attachment_id, a.mime_type, a.width, a.height, a.bytes, a.object_key
  FROM messages m JOIN turns t ON t.conversation_id = m.conversation_id AND t.id = m.turn_id
  JOIN conversations c ON c.id = m.conversation_id LEFT JOIN attachments a ON a.message_id = m.id
  WHERE c.id = ? AND c.user_id = ? AND c.expires_at > ?`
const ownedSQL = `EXISTS (SELECT 1 FROM conversations c WHERE c.id = ? AND c.user_id = ? AND c.expires_at > ?)`
const summary = (row: ConversationRow): ConversationSummary => ({ id: row.id, title: row.title, createdAt: row.created_at, updatedAt: row.updated_at })
export function savedMessage(row: MessageRow): SavedMessage {
  return {
    id: row.id, conversationId: row.conversation_id, turnId: row.turn_id, role: row.role, content: row.content,
    createdAt: row.created_at, turnStatus: row.status,
    ...(row.error_code && row.error_message ? { turnError: { code: row.error_code, message: row.error_message } } : {}),
    ...(row.attachment_id ? { attachment: { id: row.attachment_id, mimeType: row.mime_type, width: row.width, height: row.height, bytes: row.bytes } } : {}),
  }
}

export class ConversationRepository {
  constructor(readonly db: D1Database, readonly userId: string, readonly clock = () => new Date().toISOString()) {}

  async conversation(id: string) {
    const row = await this.db.prepare('SELECT id, title, created_at, updated_at FROM conversations WHERE id = ? AND user_id = ? AND expires_at > ?')
      .bind(id, this.userId, this.clock()).first<ConversationRow>()
    if (!row) notFound()
    return summary(row)
  }

  async list(encoded: string | null): Promise<ConversationPage> {
    type Position = { time: string; id: string }
    const position = cursor(encoded, (value): value is Position => !!value && typeof value === 'object'
      && 'time' in value && typeof value.time === 'string' && 'id' in value && typeof value.id === 'string')
    const rows = await this.db.prepare(`SELECT id, title, created_at, updated_at FROM conversations c
      WHERE user_id = ? AND expires_at > ? AND EXISTS (SELECT 1 FROM messages WHERE conversation_id = c.id)
      ${position ? 'AND (updated_at, id) < (?, ?)' : ''} ORDER BY updated_at DESC, id DESC LIMIT 21`)
      .bind(this.userId, this.clock(), ...(position ? [position.time, position.id] : [])).all<ConversationRow>()
    const page = rows.results.slice(0, 20)
    const last = page.at(-1)
    return { conversations: page.map(summary), nextCursor: rows.results.length > 20 && last ? encodeCursor({ time: last.updated_at, id: last.id }) : null }
  }

  async expirePending(id: string) {
    const now = this.clock()
    await this.db.prepare(`UPDATE turns SET status = 'failed', error_code = 'INTERRUPTED',
      error_message = 'This response was interrupted. Retry to continue.', updated_at = ?
      WHERE conversation_id = ? AND status = 'pending' AND attempt_started_at <= ? AND ${ownedSQL}`)
      .bind(now, id, new Date(Date.parse(now) - 120_000).toISOString(), id, this.userId, now).run()
  }

  async messages(id: string, encoded: string | null): Promise<MessagePage> {
    await this.conversation(id)
    await this.expirePending(id)
    type Position = { ordinal: number; rank: number }
    const position = cursor(encoded, (value): value is Position => !!value && typeof value === 'object'
      && 'ordinal' in value && Number.isSafeInteger(value.ordinal) && Number(value.ordinal) > 0
      && 'rank' in value && (value.rank === 0 || value.rank === 1))
    const rows = await this.db.prepare(`${messageSQL} ${position ? "AND (t.ordinal, CASE m.role WHEN 'user' THEN 0 ELSE 1 END) < (?, ?)" : ''}
      ORDER BY t.ordinal DESC, rank DESC LIMIT 51`)
      .bind(id, this.userId, this.clock(), ...(position ? [position.ordinal, position.rank] : [])).all<MessageRow>()
    const page = rows.results.slice(0, 50)
    const last = page.at(-1)
    return { messages: page.reverse().map(savedMessage), nextCursor: rows.results.length > 50 && last ? encodeCursor({ ordinal: last.ordinal, rank: last.rank }) : null }
  }

  async turn(id: string, turnId: string): Promise<TurnRow | null> {
    return this.db.prepare(`SELECT t.id, t.status, t.input_hash, t.attempt_id, t.ordinal FROM turns t
      JOIN conversations c ON c.id = t.conversation_id WHERE c.id = ? AND c.user_id = ? AND c.expires_at > ? AND t.id = ?`)
      .bind(id, this.userId, this.clock(), turnId).first<TurnRow>()
  }

  async result(id: string, turnId: string): Promise<TurnResult> {
    await this.conversation(id)
    await this.expirePending(id)
    const turn = await this.turn(id, turnId)
    if (!turn) notFound()
    const rows = await this.db.prepare(`${messageSQL} AND t.id = ? ORDER BY rank`)
      .bind(id, this.userId, this.clock(), turnId).all<MessageRow>()
    const messages = rows.results.map(savedMessage)
    return { turnId, status: turn.status, messages, ...(messages[0]?.turnError ? { error: messages[0].turnError } : {}) }
  }

  async reserve(id: string, turnId: string, hash: string, content: string, first: boolean, attachment?: StoredAttachment): Promise<{ attemptId: string; replay?: TurnResult }> {
    await this.expirePending(id)
    const existing = await this.turn(id, turnId)
    if (existing?.input_hash !== undefined && existing.input_hash !== hash) throw new ConversationError('CONFLICT', 'This request ID was already used for different content.', 409)
    if (existing && existing.status !== 'failed') return { attemptId: existing.attempt_id, replay: await this.result(id, turnId) }
    if (!first) await this.conversation(id)
    const now = this.clock()
    const attemptId = crypto.randomUUID()
    const binds = [id, this.userId, now]
    if (existing) {
      const changed = await this.db.prepare(`UPDATE turns SET status = 'pending', attempt_id = ?, attempt_started_at = ?,
        updated_at = ?, error_code = NULL, error_message = NULL WHERE conversation_id = ? AND id = ? AND status = 'failed'
        AND NOT EXISTS (SELECT 1 FROM turns other WHERE other.conversation_id = ? AND other.status = 'pending') AND ${ownedSQL}`)
        .bind(attemptId, now, now, id, turnId, id, ...binds).run()
      if (!changed.meta.changes) throw new ConversationError('CONFLICT', 'Another response is running in this chat. Please wait.', 409)
      return { attemptId }
    }
    const statements: D1PreparedStatement[] = []
    if (first) statements.push(this.db.prepare(`INSERT INTO conversations (id, user_id, title, created_at, updated_at)
      VALUES (?, ?, 'New chat', ?, ?) ON CONFLICT (id) DO NOTHING`).bind(id, this.userId, now, now))
    statements.push(this.db.prepare(`INSERT INTO turns (conversation_id, id, ordinal, status, attempt_id, attempt_started_at, input_hash, created_at, updated_at)
      SELECT ?, ?, COALESCE((SELECT MAX(ordinal) FROM turns WHERE conversation_id = ?), 0) + 1, 'pending', ?, ?, ?, ?, ?
      WHERE ${ownedSQL} ${first ? 'AND NOT EXISTS (SELECT 1 FROM messages WHERE conversation_id = ?)' : ''}`)
      .bind(id, turnId, id, attemptId, now, hash, now, now, ...binds, ...(first ? [id] : [])))
    statements.push(this.db.prepare(`INSERT INTO messages (id, conversation_id, turn_id, role, content, created_at)
      SELECT ?, ?, ?, 'user', ?, ? WHERE EXISTS (SELECT 1 FROM turns WHERE conversation_id = ? AND id = ? AND attempt_id = ?)`)
      .bind(crypto.randomUUID(), id, turnId, content, now, id, turnId, attemptId))
    if (attachment) statements.push(this.db.prepare(`INSERT INTO attachments (id, conversation_id, message_id, object_key, mime_type, width, height, bytes)
      SELECT ?, ?, m.id, ?, ?, ?, ?, ? FROM messages m JOIN turns t ON t.conversation_id = m.conversation_id AND t.id = m.turn_id
      WHERE m.conversation_id = ? AND m.turn_id = ? AND m.role = 'user' AND t.attempt_id = ?`)
      .bind(attachment.id, id, attachment.object_key, attachment.mime_type, attachment.width, attachment.height, attachment.bytes, id, turnId, attemptId))
    try {
      const results = await this.db.batch(statements)
      if (!results[first ? 1 : 0].meta.changes) {
        await this.conversation(id)
        throw new ConversationError('CONFLICT', 'This chat already exists. Open it to continue.', 409)
      }
    } catch (error) {
      if (error instanceof ConversationError) throw error
      // An atomic uniqueness race can be recovered by checking the accepted turn.
      const raced = await this.turn(id, turnId)
      if (raced?.input_hash === hash) return { attemptId: raced.attempt_id, replay: await this.result(id, turnId) }
      if (raced || await this.db.prepare(`SELECT 1 FROM turns WHERE conversation_id = ? AND status = 'pending' AND ${ownedSQL}`).bind(id, ...binds).first()) {
        throw new ConversationError('CONFLICT', 'Another response is running or this request ID was reused.', 409)
      }
      throw new ConversationError('SAVE_UNAVAILABLE', 'The message could not be saved. Please retry.', 503)
    }
    return { attemptId }
  }

  async finish(id: string, turnId: string, attemptId: string, reply: string) {
    const now = this.clock()
    // Insertion and completion are one transaction. A stale attempt inserts nothing.
    const results = await this.db.batch([
      this.db.prepare(`INSERT INTO messages (id, conversation_id, turn_id, role, content, created_at)
        SELECT ?, ?, ?, 'assistant', ?, ? WHERE EXISTS (SELECT 1 FROM turns WHERE conversation_id = ? AND id = ? AND attempt_id = ? AND status = 'pending')
        AND ${ownedSQL}`).bind(crypto.randomUUID(), id, turnId, reply, now, id, turnId, attemptId, id, this.userId, now),
      this.db.prepare(`UPDATE turns SET status = 'completed', updated_at = ? WHERE conversation_id = ? AND id = ? AND attempt_id = ? AND status = 'pending'
        AND ${ownedSQL}`).bind(now, id, turnId, attemptId, id, this.userId, now),
    ])
    return results[0].meta.changes > 0 && results[1].meta.changes > 0
  }

  async fail(id: string, turnId: string, attemptId: string, code: string, message: string) {
    const now = this.clock()
    await this.db.prepare(`UPDATE turns SET status = 'failed', error_code = ?, error_message = ?, updated_at = ?
      WHERE conversation_id = ? AND id = ? AND attempt_id = ? AND status = 'pending' AND ${ownedSQL}`)
      .bind(code, message, now, id, turnId, attemptId, id, this.userId, now).run()
  }

  async context(id: string, turnId: string) {
    return (await this.db.prepare(`${messageSQL} AND (t.status = 'completed' OR t.id = ?)
      AND t.ordinal <= (SELECT ordinal FROM turns WHERE conversation_id = ? AND id = ?)
      ORDER BY t.ordinal DESC, rank DESC LIMIT 21`).bind(id, this.userId, this.clock(), turnId, id, turnId).all<MessageRow>()).results.reverse()
  }

  async attachment(id: string, attachmentId: string) {
    const row = await this.db.prepare(`SELECT a.* FROM attachments a JOIN conversations c ON c.id = a.conversation_id
      WHERE c.id = ? AND c.user_id = ? AND c.expires_at > ? AND a.id = ?`)
      .bind(id, this.userId, this.clock(), attachmentId).first<StoredAttachment>()
    if (!row) notFound()
    return row
  }

  async title(id: string, title: string) {
    await this.db.prepare("UPDATE conversations SET title = ? WHERE id = ? AND user_id = ? AND expires_at > ? AND title = 'New chat'")
      .bind(title, id, this.userId, this.clock()).run()
  }
}
