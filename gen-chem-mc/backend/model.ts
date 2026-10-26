import { MAX_HISTORY_CHARACTERS, MAX_MESSAGE_CHARACTERS, MAX_MESSAGES, type ChatMessage } from '../shared/coach.ts'
import { COACH_INSTRUCTIONS } from './policy.ts'
import { inspectImage, MAX_HISTORY_IMAGES, MAX_IMAGE_BYTES } from '../shared/images.ts'

export const GEMMA_MODEL = '@cf/google/gemma-4-26b-a4b-it'
export const MAX_BODY_BYTES = Math.ceil(MAX_HISTORY_IMAGES * MAX_IMAGE_BYTES * 4 / 3) + 64 * 1024
const PROVIDER_TIMEOUT_MS = 30_000

type ProviderPart = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
export type ProviderMessage = { role: 'system' | 'user' | 'assistant'; content: string | ProviderPart[] }

export interface Env {
  AI: {
    run(model: string, input: {
      messages: ProviderMessage[]
      max_completion_tokens: number
      chat_template_kwargs: { enable_thinking: false }
      stream: false
    }): Promise<unknown>
  }
  TEAM_API_TOKEN?: string
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

function failure(code: string, message: string, status: number) {
  return json({ error: { code, message } }, status)
}

async function readBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader()
  if (!reader) throw new Error('INVALID_BODY')
  const chunks: Uint8Array[] = []
  let length = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    length += value.byteLength
    if (length > MAX_BODY_BYTES) {
      await reader.cancel()
      throw new Error('BODY_TOO_LARGE')
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return JSON.parse(new TextDecoder().decode(bytes))
}

function validateMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== 'object' || !('messages' in body) || !Array.isArray(body.messages)) return null
  const messages = body.messages
  if (!messages.length || messages.length > MAX_MESSAGES || messages.length % 2 === 0) return null
  const validated: ChatMessage[] = []
  let total = 0
  let images = 0
  for (let i = 0; i < messages.length; i++) {
    const message: unknown = messages[i]
    if (!message || typeof message !== 'object' || !('role' in message) || !('content' in message)) return null
    const expectedRole = i % 2 === 0 ? 'user' : 'assistant'
    if (message.role !== expectedRole || typeof message.content !== 'string') return null
    const content = message.content.trim()
    if (!content || content.length > MAX_MESSAGE_CHARACTERS) return null
    total += content.length
    if (total > MAX_HISTORY_CHARACTERS) return null
    let attachment
    if ('image' in message) {
      if (expectedRole !== 'user') return null
      const inspected = inspectImage(message.image)
      if (!inspected || ++images > MAX_HISTORY_IMAGES) return null
      attachment = inspected.image
    }
    validated.push({ role: expectedRole, content, ...(attachment ? { image: attachment } : {}) })
  }
  return validated
}

function finalReply(value: unknown): string | null {
  if (!value || typeof value !== 'object' || !('choices' in value) || !Array.isArray(value.choices)) return null
  const choice: unknown = value.choices[0]
  if (!choice || typeof choice !== 'object' || !('message' in choice)) return null
  const message = choice.message
  if (!message || typeof message !== 'object' || !('content' in message) || typeof message.content !== 'string') return null
  const reply = message.content.trim()
  if (!reply || reply.length > MAX_MESSAGE_CHARACTERS || /<\/?think\b/i.test(reply)) return null
  if ('finish_reason' in choice && choice.finish_reason === 'length') return null
  return reply
}

function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const record = error as Record<string, unknown>
  return record.status === 429 || record.statusCode === 429 || record.code === 429 || record.code === 3040 || record.code === 3043 || /\b(429|3040|3043)\b|quota|rate.?limit|out of capacity/i.test(String(record.message ?? ''))
}

type InferenceOutcome = 'success' | 'invalid_reply' | 'timeout' | 'quota_exhausted' | 'provider_error'

function logUsage(result: unknown, outcome: InferenceOutcome, startedAt: number) {
  const usage = result && typeof result === 'object' && 'usage' in result && result.usage && typeof result.usage === 'object'
    ? result.usage as Record<string, unknown>
    : {}
  function count(value: unknown): number | null {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null
  }
  // Allowlist metadata: never log the request, provider response, errors, or credentials.
  console.log({
    event: 'coach_usage',
    model: GEMMA_MODEL,
    outcome,
    duration_ms: Math.max(0, Date.now() - startedAt),
    prompt_tokens: count(usage.prompt_tokens),
    completion_tokens: count(usage.completion_tokens),
    total_tokens: count(usage.total_tokens),
  })
}

export function createHandler(timeoutMs = PROVIDER_TIMEOUT_MS) {
  return {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url)
      const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
      // Unconfigured hosted Workers fail closed. Local development needs no token.
      if (!env.TEAM_API_TOKEN && !local) return failure('NOT_CONFIGURED', 'The team coach endpoint has not been configured.', 503)
      if (env.TEAM_API_TOKEN && request.headers.get('Authorization') !== `Bearer ${env.TEAM_API_TOKEN}`) {
        return failure('UNAUTHORIZED', 'The team coach access token is missing or incorrect. Check your local setup.', 401)
      }
      if (url.pathname === '/api/health' && request.method === 'GET') return json({ status: 'ok', model: GEMMA_MODEL, capabilities: { images: true } })
      if (url.pathname !== '/api/coach') return failure('NOT_FOUND', 'This endpoint does not exist.', 404)
      if (request.method !== 'POST') return failure('METHOD_NOT_ALLOWED', 'Send a POST request to the coach.', 405)
      if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
        return failure('INVALID_BODY', 'Send the coach message as JSON.', 415)
      }
      let body: unknown
      try {
        body = await readBody(request)
      } catch (error) {
        if (error instanceof Error && error.message === 'BODY_TOO_LARGE') return failure('BODY_TOO_LARGE', 'The message is too large. Use a smaller image or shorter message.', 413)
        return failure('INVALID_BODY', 'The coach request could not be read.', 400)
      }
      const messages = validateMessages(body)
      if (!messages) return failure('INVALID_MESSAGES', 'Use valid text and JPEG or PNG attachments under 2 MB, with no more than two images in the recent conversation.', 400)

      const providerMessages: ProviderMessage[] = messages.map(message => ({
        role: message.role,
        content: message.image ? [
          { type: 'text', text: message.content },
          { type: 'image_url', image_url: { url: message.image.dataUrl } },
        ] : message.content,
      }))

      const startedAt = Date.now()
      let timer: ReturnType<typeof setTimeout> | undefined
      try {
        const result = await Promise.race([
          env.AI.run(GEMMA_MODEL, {
            messages: [{ role: 'system', content: COACH_INSTRUCTIONS }, ...providerMessages],
            max_completion_tokens: 1024,
            // Gemma defaults to reasoning mode, which can exhaust this short reply budget before any final text.
            chat_template_kwargs: { enable_thinking: false },
            stream: false,
          }),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error('PROVIDER_TIMEOUT')), timeoutMs)
          }),
        ])
        const reply = finalReply(result)
        logUsage(result, reply ? 'success' : 'invalid_reply', startedAt)
        if (!reply) return failure('INVALID_REPLY', 'The coach could not finish a usable response. Please retry.', 502)
        return json({ reply, model: GEMMA_MODEL })
      } catch (error) {
        logUsage(null, error instanceof Error && error.message === 'PROVIDER_TIMEOUT' ? 'timeout' : isQuotaError(error) ? 'quota_exhausted' : 'provider_error', startedAt)
        if (error instanceof Error && error.message === 'PROVIDER_TIMEOUT') return failure('TIMEOUT', 'The coach is taking too long. Please retry in a moment.', 504)
        if (isQuotaError(error)) return failure('QUOTA_EXHAUSTED', 'The coach is busy or its free allowance has been reached. Try again later.', 429)
        return failure('COACH_UNAVAILABLE', 'The coach is unavailable right now. Please try again shortly.', 503)
      } finally {
        if (timer !== undefined) clearTimeout(timer)
      }
    },
  }
}

export default createHandler()
