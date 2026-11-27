import type { SendTurnRequest } from '../../shared/conversations.ts'
import { MAX_MESSAGE_CHARACTERS } from '../../shared/coach.ts'
import { inspectImage } from '../../shared/images.ts'
import { ConversationError } from './errors.ts'

export function uuid(value: unknown): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new ConversationError('INVALID_ID', 'Use a valid conversation or turn ID.', 400)
  }
  return value.toLowerCase()
}

export function sendTurn(value: unknown): SendTurnRequest {
  if (!value || typeof value !== 'object' || !('clientTurnId' in value) || !('content' in value)
    || typeof value.content !== 'string' || !value.content.trim() || value.content.trim().length > MAX_MESSAGE_CHARACTERS) {
    throw new ConversationError('INVALID_MESSAGE', 'Enter a message of up to 2,000 characters.', 400)
  }
  const image = 'image' in value ? inspectImage(value.image) : undefined
  if (image === null) throw new ConversationError('INVALID_IMAGE', 'Use a valid JPEG or PNG up to 2 MB and within the image dimensions limit.', 400)
  return { clientTurnId: uuid(value.clientTurnId), content: value.content.trim(), ...(image ? { image: image.image } : {}) }
}

export async function inputHash(input: SendTurnRequest) {
  const bytes = new TextEncoder().encode(JSON.stringify([input.content, input.image?.dataUrl ?? null]))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export function cursor<T>(encoded: string | null, valid: (value: unknown) => value is T): T | null {
  if (!encoded) return null
  try {
    if (encoded.length > 512) throw new Error()
    const value: unknown = JSON.parse(atob(encoded))
    if (valid(value)) return value
  } catch { /* Invalid cursors are request errors, never raw parser errors. */ }
  throw new ConversationError('INVALID_CURSOR', 'This history page could not be opened. Refresh the list.', 400)
}

export function encodeCursor(value: unknown) {
  return btoa(JSON.stringify(value))
}
