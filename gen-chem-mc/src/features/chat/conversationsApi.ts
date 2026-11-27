import type { ConversationPage, MessagePage, ConversationSummary, SavedMessage, TurnResult, CreateConversationRequest, SendTurnRequest } from '../../../shared/conversations'
import { MAX_IMAGE_BYTES, MAX_IMAGE_DIMENSION, MAX_IMAGE_PIXELS } from '../../../shared/images'
import { apiRequest, ApiError } from '../../lib/api'

type RecordValue = Record<string, unknown>
const record = (value: unknown): value is RecordValue => !!value && typeof value === 'object' && !Array.isArray(value)
const text = (value: unknown): value is string => typeof value === 'string' && !!value.trim()
const timestamp = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d\d-\d\dT/.test(value) && Number.isFinite(Date.parse(value))
const uuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
const status = (value: unknown) => value === 'pending' || value === 'completed' || value === 'failed'
const safeError = (value: unknown) => record(value) && text(value.code) && text(value.message)
const pageCursor = (value: unknown) => value === null || typeof value === 'string' && value.length <= 512
const integer = (value: unknown, max: number): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0 && value <= max

function summary(value: unknown): value is ConversationSummary {
  return record(value) && uuid(value.id) && text(value.title) && value.title.length <= 80 && timestamp(value.createdAt) && timestamp(value.updatedAt)
}
function message(value: unknown): value is SavedMessage {
  if (!record(value) || !uuid(value.id) || !uuid(value.conversationId) || !uuid(value.turnId)
    || (value.role !== 'user' && value.role !== 'assistant') || !text(value.content) || value.content.length > 2000
    || !timestamp(value.createdAt) || !status(value.turnStatus) || (value.turnError !== undefined && !safeError(value.turnError))) return false
  const image = value.attachment
  return image === undefined || value.role === 'user' && record(image) && uuid(image.id)
    && (image.mimeType === 'image/png' || image.mimeType === 'image/jpeg') && integer(image.bytes, MAX_IMAGE_BYTES)
    && integer(image.width, MAX_IMAGE_DIMENSION) && integer(image.height, MAX_IMAGE_DIMENSION) && image.width * image.height <= MAX_IMAGE_PIXELS
}
function turn(value: unknown, id: string, turnId: string): value is TurnResult {
  return record(value) && value.turnId === turnId && status(value.status) && Array.isArray(value.messages)
    && value.messages.length >= 1 && value.messages.length <= 2
    && value.messages.every(m => message(m) && m.conversationId === id && m.turnId === turnId && m.turnStatus === value.status)
    && value.messages[0].role === 'user' && (value.status !== 'completed' || value.messages.length === 2 && value.messages[1].role === 'assistant')
    && (value.error === undefined || safeError(value.error))
}
function checked<T>(value: unknown, valid: (value: unknown) => value is T): T {
  if (!valid(value)) throw new ApiError(502, 'INVALID_RESPONSE', 'The saved-chat response could not be read. Please retry.')
  return value
}

export function createConversationsApi(getAccessToken: () => Promise<string | null>) {
  async function token() {
    const current = await getAccessToken()
    if (!current) throw new ApiError(401, 'UNAUTHORIZED', 'Sign in to access saved conversations.')
    return current
  }
  async function request(path: string, init?: RequestInit) { return apiRequest<unknown>(path, await token(), init) }
  const base = (id: string) => {
    if (!uuid(id)) throw new ApiError(400, 'INVALID_ID', 'This conversation could not be opened.')
    return '/api/conversations/' + id
  }
  return {
    async list(cursor: string | null, signal?: AbortSignal): Promise<ConversationPage> {
      return checked(await request('/api/conversations' + (cursor ? '?cursor=' + encodeURIComponent(cursor) : ''), { signal }),
        (v): v is ConversationPage => record(v) && Array.isArray(v.conversations) && v.conversations.length <= 20 && v.conversations.every(summary) && pageCursor(v.nextCursor))
    },
    async messages(id: string, cursor: string | null, signal?: AbortSignal): Promise<MessagePage> {
      return checked(await request(base(id) + '/messages' + (cursor ? '?cursor=' + encodeURIComponent(cursor) : ''), { signal }),
        (v): v is MessagePage => record(v) && Array.isArray(v.messages) && v.messages.length <= 50
          && v.messages.every(m => message(m) && m.conversationId === id) && pageCursor(v.nextCursor))
    },
    async create(input: CreateConversationRequest, signal?: AbortSignal) {
      base(input.id)
      return checked(await request('/api/conversations', { method: 'POST', body: JSON.stringify(input), signal }),
        (v): v is { conversation: ConversationSummary; turn: TurnResult } => record(v) && summary(v.conversation)
          && v.conversation.id === input.id && turn(v.turn, input.id, input.firstTurn.clientTurnId))
    },
    async send(id: string, input: SendTurnRequest, signal?: AbortSignal) {
      return checked(await request(base(id) + '/turns', { method: 'POST', body: JSON.stringify(input), signal }), (v): v is TurnResult => turn(v, id, input.clientTurnId))
    },
    async recover(id: string, turnId: string, signal?: AbortSignal) {
      if (!uuid(turnId)) throw new ApiError(400, 'INVALID_ID', 'This response could not be opened.')
      return checked(await request(base(id) + '/turns/' + turnId, { signal }), (v): v is TurnResult => turn(v, id, turnId))
    },
    async image(id: string, attachmentId: string, signal?: AbortSignal): Promise<Blob> {
      if (!uuid(attachmentId)) throw new ApiError(400, 'INVALID_ID', 'This image could not be opened.')
      const accessToken = await token()
      const response = await fetch(base(id) + '/attachments/' + attachmentId, { headers: { Authorization: `Bearer ${accessToken}` }, signal, redirect: 'error' })
      if (!response.ok) throw new ApiError(response.status, 'IMAGE_UNAVAILABLE', 'The saved image could not be loaded. Please retry.')
      const blob = await response.blob()
      if (!['image/png', 'image/jpeg'].includes(blob.type) || !blob.size || blob.size > MAX_IMAGE_BYTES) throw new ApiError(502, 'INVALID_IMAGE', 'The saved image could not be read safely.')
      return blob
    },
  }
}

export type ConversationsApi = ReturnType<typeof createConversationsApi>
