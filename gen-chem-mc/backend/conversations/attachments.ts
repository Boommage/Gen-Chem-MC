import { inspectImage, MAX_IMAGE_BYTES, type ImageAttachment } from '../../shared/images.ts'
import type { WorkerEnv } from '../env.ts'
import { ConversationError } from './errors.ts'
import type { StoredAttachment } from './repository.ts'

export const IMAGE_BUDGET = { bytes: 8_000_000_000, classA: 800_000, classB: 8_000_000, uploadsPerDay: 50, readsPerDay: 500 } as const

export function imageStorage(env: WorkerEnv) {
  if (!env.DB || !env.CHAT_IMAGES || env.CHAT_IMAGE_STORAGE_ENABLED !== 'true') {
    throw new ConversationError('IMAGE_STORAGE_UNAVAILABLE', 'Saving images is not configured yet. Your draft is still available.', 503)
  }
  return { db: env.DB, bucket: env.CHAT_IMAGES }
}

async function reserve(env: WorkerEnv, userId: string, kind: 'upload' | 'read', key: string, bytes: number) {
  const { db } = imageStorage(env)
  const now = new Date().toISOString()
  const day = now.slice(0, 10)
  const upload = kind === 'upload' ? 1 : 0
  const read = kind === 'read' ? 1 : 0
  const results = await db.batch([
    db.prepare(`UPDATE r2_usage SET class_a = class_a + ?, class_b = class_b + ?, upload_bytes = upload_bytes +
      CASE WHEN ? = 1 AND NOT EXISTS (SELECT 1 FROM image_objects WHERE object_key = ?) THEN ? ELSE 0 END
      WHERE id = 1 AND class_a + ? <= ? AND class_b + ? <= ? AND upload_bytes +
      CASE WHEN ? = 1 AND NOT EXISTS (SELECT 1 FROM image_objects WHERE object_key = ?) THEN ? ELSE 0 END <= ?
      AND NOT EXISTS (SELECT 1 FROM image_rate_limits WHERE user_id = ? AND day = ? AND (uploads + ? > ? OR reads + ? > ?))`)
      .bind(upload, read, upload, key, bytes, upload, IMAGE_BUDGET.classA, read, IMAGE_BUDGET.classB,
        upload, key, bytes, IMAGE_BUDGET.bytes, userId, day, upload, IMAGE_BUDGET.uploadsPerDay, read, IMAGE_BUDGET.readsPerDay),
    db.prepare(`INSERT INTO image_rate_limits (user_id, day, uploads, reads) SELECT ?, ?, ?, ? WHERE changes() = 1
      ON CONFLICT (user_id, day) DO UPDATE SET uploads = uploads + excluded.uploads, reads = reads + excluded.reads`)
      .bind(userId, day, upload, read),
    db.prepare(`INSERT INTO image_objects (object_key, bytes, state, created_at)
      SELECT ?, ?, 'reserved', ? WHERE changes() = 1 AND ? = 1 ON CONFLICT (object_key) DO NOTHING`).bind(key, bytes, now, upload),
  ])
  if (!results[0].meta.changes) throw new ConversationError('IMAGE_BUDGET_REACHED', 'The image storage or daily usage limit has been reached. Text chat is still available.', 429)
}

export function attachmentMetadata(conversationId: string, turnId: string, hash: string, image: ImageAttachment): StoredAttachment {
  const inspected = inspectImage(image)
  if (!inspected) throw new ConversationError('INVALID_IMAGE', 'The image could not be read.', 400)
  return { id: crypto.randomUUID(), object_key: `chat/${conversationId}/${turnId}/${hash}`, mime_type: image.dataUrl.startsWith('data:image/png;') ? 'image/png' : 'image/jpeg', width: inspected.width, height: inspected.height, bytes: inspected.bytes }
}

export async function saveImage(env: WorkerEnv, userId: string, attachment: StoredAttachment, image: ImageAttachment) {
  const { db, bucket } = imageStorage(env)
  const existing = await db.prepare('SELECT state FROM image_objects WHERE object_key = ?').bind(attachment.object_key).first<{ state: string }>()
  if (existing?.state === 'stored') return
  await reserve(env, userId, 'upload', attachment.object_key, attachment.bytes)
  const bytes = Uint8Array.from(atob(image.dataUrl.split(',')[1]), char => char.charCodeAt(0))
  try {
    await bucket.put(attachment.object_key, bytes, { httpMetadata: { contentType: attachment.mime_type }, storageClass: 'Standard' })
    await db.prepare("UPDATE image_objects SET state = 'stored' WHERE object_key = ?").bind(attachment.object_key).run()
  } catch {
    // Keep the reservation: the provider may have accepted an uncertain upload.
    throw new ConversationError('IMAGE_SAVE_FAILED', 'The image could not be saved. Retry with the original image.', 503)
  }
}

export async function loadImage(env: WorkerEnv, userId: string, attachment: StoredAttachment): Promise<ImageAttachment> {
  const { bucket } = imageStorage(env)
  await reserve(env, userId, 'read', attachment.object_key, 0)
  const object = await bucket.get(attachment.object_key)
  if (!object || object.size !== attachment.bytes || object.size > MAX_IMAGE_BYTES) {
    throw new ConversationError('IMAGE_UNAVAILABLE', 'A saved image is unavailable. Attach it again in a new message.', 503)
  }
  const bytes = new Uint8Array(await object.arrayBuffer())
  let binary = ''
  for (let i = 0; i < bytes.length; i += 16_384) binary += String.fromCharCode(...bytes.subarray(i, i + 16_384))
  const image = { name: `attachment.${attachment.mime_type === 'image/png' ? 'png' : 'jpg'}`, dataUrl: `data:${attachment.mime_type};base64,${btoa(binary)}` }
  const inspected = inspectImage(image)
  if (!inspected || inspected.width !== attachment.width || inspected.height !== attachment.height) {
    throw new ConversationError('IMAGE_UNAVAILABLE', 'A saved image could not be read safely. Attach it again in a new message.', 503)
  }
  return image
}
