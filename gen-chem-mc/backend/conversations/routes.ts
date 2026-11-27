import type { AuthUser } from '../../shared/auth.ts'
import { MAX_BODY_BYTES, CoachInferenceError } from '../model.ts'
import type { WorkerEnv } from '../env.ts'
import { json, failure } from '../http.ts'
import { ConversationError } from './errors.ts'
import { loadImage } from './attachments.ts'
import { ConversationRepository } from './repository.ts'
import { submitTurn } from './service.ts'
import { sendTurn, uuid } from './validation.ts'

async function body(request: Request): Promise<unknown> {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) throw new ConversationError('INVALID_BODY', 'Send the message as JSON.', 415)
  const reader = request.body?.getReader()
  if (!reader) throw new ConversationError('INVALID_BODY', 'The message could not be read.', 400)
  let length = 0
  const decoder = new TextDecoder()
  let text = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    length += value.byteLength
    if (length > MAX_BODY_BYTES) {
      await reader.cancel()
      throw new ConversationError('BODY_TOO_LARGE', 'The message is too large.', 413)
    }
    text += decoder.decode(value, { stream: true })
  }
  try { return JSON.parse(text + decoder.decode()) } catch { throw new ConversationError('INVALID_BODY', 'The message could not be read.', 400) }
}

export async function handleConversations(request: Request, env: WorkerEnv, user: AuthUser): Promise<Response> {
  try {
    if (!env.DB) throw new ConversationError('STORAGE_UNAVAILABLE', 'Saved conversations are not configured yet.', 503)
    const repo = new ConversationRepository(env.DB, user.id)
    const url = new URL(request.url)
    const parts = url.pathname.split('/').filter(Boolean)
    const method = request.method
    if (parts.length === 2 && method === 'GET') return json(await repo.list(url.searchParams.get('cursor')))
    if (parts.length === 2 && method === 'POST') {
      const input = await body(request)
      if (!input || typeof input !== 'object' || !('id' in input) || !('firstTurn' in input)) throw new ConversationError('INVALID_BODY', 'Include the first message when creating a chat.', 400)
      const id = uuid(input.id)
      const result = await submitTurn(repo, env, id, sendTurn(input.firstTurn), true)
      return json({ conversation: await repo.conversation(id), turn: result }, result.status === 'pending' ? 202 : 200)
    }
    if (parts.length >= 3) {
      const id = uuid(parts[2])
      if (parts.length === 4 && parts[3] === 'messages' && method === 'GET') return json(await repo.messages(id, url.searchParams.get('cursor')))
      if (parts.length === 4 && parts[3] === 'turns' && method === 'POST') {
        const result = await submitTurn(repo, env, id, sendTurn(await body(request)))
        return json(result, result.status === 'pending' ? 202 : 200)
      }
      if (parts.length === 5 && parts[3] === 'turns' && method === 'GET') return json(await repo.result(id, uuid(parts[4])))
      if (parts.length === 5 && parts[3] === 'attachments' && method === 'GET') {
        const attachment = await repo.attachment(id, uuid(parts[4]))
        const image = await loadImage(env, user.id, attachment)
        const bytes = Uint8Array.from(atob(image.dataUrl.split(',')[1]), char => char.charCodeAt(0))
        return new Response(bytes, { headers: { 'Content-Type': attachment.mime_type, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } })
      }
    }
    return failure('NOT_FOUND', 'This endpoint does not exist.', 404)
  } catch (error) {
    if (error instanceof ConversationError || error instanceof CoachInferenceError) return failure(error.code, error.message, error.status)
    return failure('STORAGE_UNAVAILABLE', 'Saved conversations are unavailable. Please retry.', 503)
  }
}
