// @vitest-environment node
import { expect, it } from 'vitest'
import { recentConversation, type ChatMessage } from './coach'
import { PNG_IMAGE } from './imageFixtures'

it('drops whole old pairs while preserving the latest question and valid role order', () => {
  const messages: ChatMessage[] = Array.from({ length: 25 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: String(i) }))
  const recent = recentConversation(messages)
  expect(recent.length).toBe(21)
  expect(recent[0]).toEqual({ role: 'user', content: '4' })
  expect(recent.at(-1)).toEqual({ role: 'user', content: '24' })
  expect(messages.length).toBe(25)
})

it('bounds accumulated context, not just the message count', () => {
  const messages: ChatMessage[] = Array.from({ length: 9 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'x'.repeat(2000) }))
  expect(recentConversation(messages)).toHaveLength(5)
})

it('drops old image pairs to keep at most two recent image attachments', () => {
  const messages: ChatMessage[] = Array.from({ length: 5 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: String(i), ...(i % 2 ? {} : { image: PNG_IMAGE }) }))
  const recent = recentConversation(messages)
  expect(recent).toHaveLength(3)
  expect(recent[0].role).toBe('user')
  expect(recent.at(-1)?.image).toEqual(PNG_IMAGE)
  expect(messages).toHaveLength(5)
})
