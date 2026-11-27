import type { ImageAttachment } from './images.ts'
import type { ApiErrorResponse } from './api.ts'

export type TurnStatus = 'pending' | 'completed' | 'failed'

export interface ConversationSummary {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface SavedAttachment {
  id: string
  mimeType: 'image/jpeg' | 'image/png'
  width: number
  height: number
  bytes: number
}

export interface SavedMessage {
  id: string
  conversationId: string
  turnId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  turnStatus: TurnStatus
  turnError?: ApiErrorResponse['error']
  attachment?: SavedAttachment
}

export interface ConversationPage {
  conversations: ConversationSummary[]
  nextCursor: string | null
}

export interface MessagePage {
  messages: SavedMessage[]
  nextCursor: string | null
}

export interface CreateConversationRequest {
  id: string
}

export interface SendTurnRequest {
  clientTurnId: string
  content: string
  image?: ImageAttachment
}

export interface TurnResult {
  turnId: string
  status: TurnStatus
  messages: SavedMessage[]
  error?: ApiErrorResponse['error']
}
