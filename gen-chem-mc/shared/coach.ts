export type ChatMessage = { role: 'user' | 'assistant'; content: string }
export const MAX_MESSAGES = 21
export const MAX_MESSAGE_CHARACTERS = 2000
export const MAX_HISTORY_CHARACTERS = 12000

// Drop whole oldest user/assistant pairs; never leave an assistant first.
export function recentConversation(messages: ChatMessage[]): ChatMessage[] {
  const recent = [...messages]
  while (recent.length > MAX_MESSAGES || recent.reduce((sum, message) => sum + message.content.length, 0) > MAX_HISTORY_CHARACTERS) {
    if (recent.length <= 1) break
    recent.splice(0, 2)
  }
  return recent
}
