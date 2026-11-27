import type { WorkerEnv } from '../env.ts'

export async function cleanupConversations(env: WorkerEnv, now = new Date().toISOString()) {
  if (!env.DB) return
  const db = env.DB
  // Small bounded batches avoid an unbounded scheduled invocation.
  await db.batch([
    db.prepare('DELETE FROM conversations WHERE id IN (SELECT id FROM conversations WHERE expires_at <= ? LIMIT 200)').bind(now),
    db.prepare('DELETE FROM image_rate_limits WHERE day < ?').bind(now.slice(0, 10)),
    db.prepare(`INSERT INTO image_deletions (object_key)
      SELECT object_key FROM image_objects o WHERE o.created_at < ?
      AND NOT EXISTS (SELECT 1 FROM attachments a WHERE a.object_key = o.object_key)
      ON CONFLICT (object_key) DO NOTHING`).bind(new Date(Date.parse(now) - 600_000).toISOString()),
  ])
  // Deletes are free operations; allow cleanup even when read/upload budgets
  // are exhausted. Do not perform any object calls without the explicit opt-in.
  if (!env.CHAT_IMAGES || env.CHAT_IMAGE_STORAGE_ENABLED !== 'true') return
  const queued = await db.prepare(`SELECT q.object_key, o.state FROM image_deletions q
    LEFT JOIN image_objects o ON o.object_key = q.object_key ORDER BY q.queued_at LIMIT 100`).all<{ object_key: string; state: string | null }>()
  for (const item of queued.results) {
    try {
      await env.CHAT_IMAGES.delete(item.object_key)
      // An uncertain put can finish late. Keep retrying deletion of reserved
      // objects and keep its conservative budget reservation.
      if (item.state === 'reserved') {
        await db.prepare('UPDATE image_deletions SET queued_at = ? WHERE object_key = ?').bind(now, item.object_key).run()
        continue
      }
      await db.batch([
        db.prepare('DELETE FROM image_deletions WHERE object_key = ?').bind(item.object_key),
        db.prepare('DELETE FROM image_objects WHERE object_key = ?').bind(item.object_key),
      ])
    } catch {
      // Queue remains durable for the next scheduled run.
      await db.prepare('UPDATE image_deletions SET queued_at = ? WHERE object_key = ?').bind(now, item.object_key).run()
    }
  }
}
