import { StrictMode } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Coach from '../../pages/Coach'
import { AuthContext, type AuthContextValue } from '../auth/AuthContext'
import type { ConversationSummary, SavedMessage, TurnResult } from '../../../shared/conversations'
import { createConversationsApi } from './conversationsApi'

const id = (n: number) => `00000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`
const time = '2026-11-27T12:00:00.000Z'
interface ChatFixture { owner: string; summary: ConversationSummary; messages: SavedMessage[] }
let chats: Map<string, ChatFixture>
let fetchMock: ReturnType<typeof vi.fn>
const auth = (owner = 'a'): AuthContextValue => ({
  state: { status: 'authenticated', user: { id: owner, email: null } },
  getAccessToken: vi.fn().mockResolvedValue('test-only-' + owner), signOut: vi.fn().mockResolvedValue(undefined),
})
const view = (value = auth()) => <AuthContext.Provider value={value}><Coach /></AuthContext.Provider>
function seed(n: number, owner = 'a') {
  const messages: SavedMessage[] = [
    { id: id(n + 100), conversationId: id(n), turnId: id(n + 200), role: 'user', content: `Question ${n}`, createdAt: time, turnStatus: 'completed' },
    { id: id(n + 300), conversationId: id(n), turnId: id(n + 200), role: 'assistant', content: `Saved reply ${n}`, createdAt: time, turnStatus: 'completed' },
  ]
  chats.set(id(n), { owner, summary: { id: id(n), title: `Study chat ${n}`, createdAt: time, updatedAt: time }, messages })
}
function turn(conversationId: string, turnId: string, content: string): TurnResult {
  return { turnId, status: 'completed', messages: [
    { id: crypto.randomUUID(), conversationId, turnId, role: 'user', content, createdAt: time, turnStatus: 'completed' },
    { id: crypto.randomUUID(), conversationId, turnId, role: 'assistant', content: 'Check **units** and $\\lambda$.', createdAt: time, turnStatus: 'completed' },
  ] }
}
function send(content: string) {
  fireEvent.change(screen.getByRole('textbox', { name: 'Message to coach' }), { target: { value: content } })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
}
beforeEach(() => {
  chats = new Map()
  fetchMock = vi.fn(async (path: string, init: RequestInit = {}) => {
    const url = new URL(path, 'http://localhost')
    const owner = new Headers(init.headers).get('Authorization')?.replace('Bearer test-only-', '')
    if (url.pathname === '/api/conversations' && init.method !== 'POST') return Response.json({ conversations: [...chats.values()].filter(chat => chat.owner === owner).map(chat => chat.summary), nextCursor: null })
    if (url.pathname === '/api/conversations' && init.method === 'POST') {
      const input = JSON.parse(init.body as string)
      const result = turn(input.id, input.firstTurn.clientTurnId, input.firstTurn.content)
      const summary = { id: input.id, title: 'Gemma study title', createdAt: time, updatedAt: time }
      chats.set(input.id, { owner: owner!, summary, messages: result.messages })
      return Response.json({ conversation: summary, turn: result })
    }
    const parts = url.pathname.split('/')
    const chat = chats.get(parts[3])
    if (!chat || chat.owner !== owner) return Response.json({ error: { code: 'NOT_FOUND', message: 'Unavailable.' } }, { status: 404 })
    if (parts[4] === 'messages') return Response.json({ messages: chat.messages, nextCursor: null })
    if (parts[4] === 'turns' && init.method === 'POST') {
      const input = JSON.parse(init.body as string)
      const result = turn(chat.summary.id, input.clientTurnId, input.content)
      chat.messages = [...chat.messages.filter(message => message.turnId !== input.clientTurnId), ...result.messages]
      return Response.json(result)
    }
    if (parts[4] === 'turns') {
      const messages = chat.messages.filter(message => message.turnId === parts[5])
      return Response.json({ turnId: parts[5], status: messages[0]?.turnStatus, messages })
    }
    return Response.json({ error: { code: 'NOT_FOUND', message: 'Unavailable.' } }, { status: 404 })
  })
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

it('creates only on first submission, displays formatted replies, and reopens saved history after remount', async () => {
  const firstView = render(view())
  await screen.findByText('No saved chats yet. Send your first message to start one.')
  fireEvent.click(screen.getByRole('button', { name: 'New chat' }))
  expect(fetchMock.mock.calls.filter(call => call[1]?.method === 'POST')).toHaveLength(0)
  send('Help me with **literal** input')
  await screen.findByRole('button', { name: /Gemma study title/ })
  expect(firstView.container.querySelector('.coach .katex')).toBeTruthy()
  expect(firstView.container.querySelector('.student strong')).toBeNull()
  expect(fetchMock.mock.calls.filter(call => call[1]?.method === 'POST')).toHaveLength(1)
  firstView.unmount()
  render(view())
  fireEvent.click(await screen.findByRole('button', { name: /Gemma study title/ }))
  await screen.findByText('Help me with **literal** input')
  expect(screen.getByText('Saved privately to your account.', { exact: false })).toBeTruthy()
})

it('discards unsent drafts when switching chats or choosing New chat', async () => {
  seed(1); seed(2)
  render(view())
  fireEvent.click(await screen.findByRole('button', { name: /Study chat 1/ }))
  await screen.findByText('Saved reply 1')
  fireEvent.change(screen.getByRole('textbox', { name: 'Message to coach' }), { target: { value: 'Unsent private draft' } })
  fireEvent.click(screen.getByRole('button', { name: /Study chat 2/ }))
  await screen.findByText('Saved reply 2')
  expect((screen.getByRole('textbox', { name: 'Message to coach' }) as HTMLInputElement).value).toBe('')
  fireEvent.change(screen.getByRole('textbox', { name: 'Message to coach' }), { target: { value: 'Another unsent draft' } })
  fireEvent.click(screen.getByRole('button', { name: 'New chat' }))
  expect((screen.getByRole('textbox', { name: 'Message to coach' }) as HTMLInputElement).value).toBe('')
  expect(screen.queryByText('Saved reply 2')).toBeNull()
})

it('lets a response finish in its original chat while another chat is selected', async () => {
  seed(1); seed(2)
  const normal = fetchMock.getMockImplementation()!
  let resolve!: (response: Response) => void
  fetchMock.mockImplementation(async (path: string, init: RequestInit = {}) => {
    if (path === `/api/conversations/${id(1)}/turns` && init.method === 'POST') return new Promise<Response>(done => { resolve = done })
    return normal(path, init)
  })
  render(view())
  fireEvent.click(await screen.findByRole('button', { name: /Study chat 1/ }))
  await screen.findByText('Saved reply 1')
  send('Original-chat follow-up')
  await screen.findByRole('status', { name: 'Coach is thinking' })
  fireEvent.click(screen.getByRole('button', { name: /Study chat 2/ }))
  await screen.findByText('Saved reply 2')
  const call = fetchMock.mock.calls.find(call => call[0] === `/api/conversations/${id(1)}/turns`)!
  expect(call[1].signal.aborted).toBe(false)
  const input = JSON.parse(call[1].body)
  const result = turn(id(1), input.clientTurnId, input.content)
  chats.get(id(1))!.messages.push(...result.messages)
  await act(async () => resolve(Response.json(result)))
  expect(screen.queryByText('Original-chat follow-up')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: /Study chat 1/ }))
  await screen.findByText('Original-chat follow-up')
})

it('clears old private content on account changes and ignores late responses from the former account', async () => {
  seed(1); seed(2, 'b')
  const normal = fetchMock.getMockImplementation()!
  let resolve!: (response: Response) => void
  fetchMock.mockImplementation(async (path: string, init: RequestInit = {}) => {
    if (path === `/api/conversations/${id(1)}/messages`) return new Promise<Response>(done => { resolve = done })
    return normal(path, init)
  })
  const { rerender } = render(view())
  fireEvent.click(await screen.findByRole('button', { name: /Study chat 1/ }))
  rerender(view(auth('b')))
  await screen.findByRole('button', { name: /Study chat 2/ })
  await act(async () => resolve(Response.json({ messages: chats.get(id(1))!.messages, nextCursor: null })))
  expect(screen.queryByText('Question 1')).toBeNull()
  expect(screen.queryByRole('button', { name: /Study chat 1/ })).toBeNull()
})

it('clears displayed history on an expired session', async () => {
  seed(1)
  const normal = fetchMock.getMockImplementation()!
  render(view())
  fireEvent.click(await screen.findByRole('button', { name: /Study chat 1/ }))
  await screen.findByText('Saved reply 1')
  fetchMock.mockImplementation(async (path: string, init: RequestInit = {}) => init.method === 'POST'
    ? Response.json({ error: { code: 'UNAUTHORIZED', message: 'Expired.' } }, { status: 401 }) : normal(path, init))
  send('New question')
  await screen.findByText('Your session is no longer valid. Sign in again to see saved chats.')
  expect(screen.queryByText('Saved reply 1')).toBeNull()
  expect(screen.queryByText('New question')).toBeNull()
})

it('loads history under StrictMode without creating empty database records', async () => {
  seed(1)
  render(<StrictMode>{view()}</StrictMode>)
  await screen.findByRole('button', { name: /Study chat 1/ })
  expect(fetchMock.mock.calls.filter(call => call[1]?.method === 'POST')).toHaveLength(0)
})

it('rejects malformed or cross-conversation DTOs at the frontend boundary', async () => {
  const api = createConversationsApi(async () => 'test-only-a')
  fetchMock.mockResolvedValueOnce(Response.json({ conversations: [{ id: 'wrong' }], nextCursor: null }))
  await expect(api.list(null)).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  seed(1)
  fetchMock.mockResolvedValueOnce(Response.json({ messages: chats.get(id(1))!.messages, nextCursor: null }))
  await expect(api.messages(id(2), null)).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
})

it('acquires the current token for each call and never sends a team token from the browser', async () => {
  const getter = vi.fn().mockResolvedValueOnce('test-only-a').mockResolvedValueOnce('test-only-b')
  const api = createConversationsApi(getter)
  await api.list(null)
  await api.list(null)
  expect(fetchMock.mock.calls.map(call => new Headers(call[1].headers).get('Authorization'))).toEqual(['Bearer test-only-a', 'Bearer test-only-b'])
  expect(fetchMock.mock.calls.every(call => !new Headers(call[1].headers).has('X-Team-Token'))).toBe(true)
})

it('retries a reopened failed turn with its original request ID', async () => {
  seed(1)
  const original = chats.get(id(1))!.messages[0]
  chats.get(id(1))!.messages = [{ ...original, turnStatus: 'failed', turnError: { code: 'TIMEOUT', message: 'Retry this saved message.' } }]
  render(view())
  fireEvent.click(await screen.findByRole('button', { name: /Study chat 1/ }))
  await screen.findByText('Retry this saved message.')
  expect((screen.getByRole('textbox', { name: 'Message to coach' }) as HTMLInputElement).disabled).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'Retry', exact: true }))
  await waitFor(() => expect(screen.queryByText('Retry this saved message.')).toBeNull())
  const post = fetchMock.mock.calls.find(call => call[1]?.method === 'POST')!
  expect(JSON.parse(post[1].body).clientTurnId).toBe(original.turnId)
  expect(chats.get(id(1))!.messages.filter(message => message.role === 'user')).toHaveLength(1)
})

it('recovers a committed first turn after a lost response without replaying the write', async () => {
  const normal = fetchMock.getMockImplementation()!
  fetchMock.mockImplementation(async (path: string, init: RequestInit = {}) => {
    const result = await normal(path, init)
    if (init.method === 'POST') throw new TypeError('Simulated lost response')
    return result
  })
  const { container } = render(view())
  await screen.findByText('No saved chats yet. Send your first message to start one.')
  send('Lost response question')
  await screen.findByRole('button', { name: /Gemma study title/ })
  expect(container.querySelector('.coach .katex')).toBeTruthy()
  expect(fetchMock.mock.calls.filter(call => call[1]?.method === 'POST')).toHaveLength(1)
  expect(fetchMock.mock.calls.some(call => /\/turns\//.test(call[0]))).toBe(true)
})

it('loads private attachments with authorization and revokes their blob URLs on chat changes', async () => {
  seed(1)
  chats.get(id(1))!.messages[0].attachment = { id: id(500), mimeType: 'image/png', width: 1, height: 1, bytes: 20 }
  const createObjectURL = vi.fn(() => 'blob:test-only-image')
  const revokeObjectURL = vi.fn()
  vi.stubGlobal('URL', Object.assign(class extends URL {}, { createObjectURL, revokeObjectURL }))
  const normal = fetchMock.getMockImplementation()!
  fetchMock.mockImplementation(async (path: string, init: RequestInit = {}) => path.includes('/attachments/')
    ? new Response(new Uint8Array([1, 2, 3]), { headers: { 'Content-Type': 'image/png' } }) : normal(path, init))
  render(view())
  fireEvent.click(await screen.findByRole('button', { name: /Study chat 1/ }))
  const image = await screen.findByAltText('Saved problem attachment')
  expect(image.getAttribute('src')).toBe('blob:test-only-image')
  const download = fetchMock.mock.calls.find(call => call[0].includes('/attachments/'))!
  expect(new Headers(download[1].headers).get('Authorization')).toBe('Bearer test-only-a')
  fireEvent.click(screen.getByRole('button', { name: 'New chat' }))
  expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:test-only-image')
})

it('prompts for an empty submission without creating a conversation', async () => {
  render(view())
  await screen.findByText('No saved chats yet. Send your first message to start one.')
  fireEvent.submit(screen.getByRole('textbox', { name: 'Message to coach' }).closest('form')!)
  await screen.findByText('Enter a message or attach an image.')
  expect(fetchMock.mock.calls.some(call => call[1]?.method === 'POST')).toBe(false)
})

it('loads more chat and message pages while keeping their chronological order', async () => {
  seed(1); seed(2)
  const normal = fetchMock.getMockImplementation()!
  fetchMock.mockImplementation(async (path: string, init: RequestInit = {}) => {
    const url = new URL(path, 'http://localhost')
    if (url.pathname === '/api/conversations') return Response.json({ conversations: [chats.get(id(url.search ? 2 : 1))!.summary], nextCursor: url.search ? null : 'older-chats' })
    if (url.pathname === `/api/conversations/${id(1)}/messages`) return Response.json({ messages: [chats.get(id(1))!.messages[url.search ? 0 : 1]], nextCursor: url.search ? null : 'older-messages' })
    return normal(path, init)
  })
  const { container } = render(view())
  fireEvent.click(await screen.findByRole('button', { name: 'More chats' }))
  await screen.findByRole('button', { name: /Study chat 2/ })
  fireEvent.click(screen.getByRole('button', { name: /Study chat 1/ }))
  await screen.findByText('Saved reply 1')
  fireEvent.click(screen.getByRole('button', { name: 'Older messages' }))
  await screen.findByText('Question 1')
  expect([...container.querySelectorAll('.conversation .message')].map(node => node.textContent)).toEqual(['Question 1', 'Saved reply 1'])
})

it('edits a failed message into a new turn while retaining the failed record', async () => {
  seed(1)
  const original = chats.get(id(1))!.messages[0]
  chats.get(id(1))!.messages = [{ ...original, turnStatus: 'failed', turnError: { code: 'TIMEOUT', message: 'Try again.' } }]
  render(view())
  fireEvent.click(await screen.findByRole('button', { name: /Study chat 1/ }))
  fireEvent.click(await screen.findByRole('button', { name: 'Edit message' }))
  await waitFor(() => expect((screen.getByRole('textbox', { name: 'Message to coach' }) as HTMLInputElement).value).toBe('Question 1'))
  send('Edited question')
  await waitFor(() => expect(chats.get(id(1))!.messages).toHaveLength(3))
  const post = fetchMock.mock.calls.find(call => call[1]?.method === 'POST')!
  expect(JSON.parse(post[1].body).clientTurnId).not.toBe(original.turnId)
  expect(chats.get(id(1))!.messages[0].turnStatus).toBe('failed')
})
