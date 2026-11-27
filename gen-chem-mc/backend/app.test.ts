// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppHandler } from './app.ts'
import type { WorkerEnv } from './env.ts'
import { failure, json } from './http.ts'

const student = { id: 'student-a', email: 'student@example.edu' }
function setup() {
  const run = vi.fn().mockResolvedValue({ choices: [{ message: { content: 'What have you tried?' }, finish_reason: 'stop' }] })
  const env: WorkerEnv = { AI: { run }, TEAM_API_TOKEN: 'test-only-team' }
  const requireUser = vi.fn().mockResolvedValue(student)
  const handleConversations = vi.fn().mockResolvedValue(json({ conversations: [], nextCursor: null }))
  return { env, run, requireUser, handleConversations }
}
function request(path = '/api/conversations', headers: HeadersInit = { 'X-Team-Token': 'test-only-team', Authorization: 'Bearer test-only-student' }) {
  return new Request('https://coach.example' + path, { headers })
}
beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}))
afterEach(() => vi.restoreAllMocks())

describe('shared Worker composition', () => {
  it('passes only the verified identity to the conversation handler', async () => {
    const { env, requireUser, handleConversations } = setup()
    const incoming = request('/api/conversations/chat-a/messages?cursor=older')
    const response = await createAppHandler({ requireUser, handleConversations }).fetch(incoming, env)
    expect(response.status).toBe(200)
    expect(requireUser).toHaveBeenCalledExactlyOnceWith(incoming, env)
    expect(handleConversations).toHaveBeenCalledExactlyOnceWith(incoming, env, student)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })

  it.each<HeadersInit>([
    {},
    { Authorization: 'Bearer test-only-team' },
    { 'X-Team-Token': 'test-only-team' },
    { 'X-Team-Token': 'test-only-team', Authorization: 'Bearer test-only-team' },
    { 'X-Team-Token': 'wrong-team', Authorization: 'Bearer test-only-student' },
  ])('refuses missing or demo-only credentials before accessing saved data: %j', async (headers) => {
    const { env, requireUser, handleConversations } = setup()
    expect((await createAppHandler({ requireUser, handleConversations }).fetch(request(undefined, headers), env)).status).toBe(401)
    expect(requireUser).not.toHaveBeenCalled()
    expect(handleConversations).not.toHaveBeenCalled()
  })

  it('never treats localhost as a signed-in student', async () => {
    const { env, requireUser, handleConversations } = setup()
    delete env.TEAM_API_TOKEN
    const response = await createAppHandler({ requireUser, handleConversations }).fetch(new Request('http://127.0.0.1/api/conversations'), env)
    expect(response.status).toBe(401)
    expect(handleConversations).not.toHaveBeenCalled()
  })

  it('returns the auth rejection without accessing conversations', async () => {
    const { env, requireUser, handleConversations } = setup()
    const rejection = failure('UNAUTHORIZED', 'Sign in again.', 401)
    requireUser.mockResolvedValueOnce(rejection)
    expect(await createAppHandler({ requireUser, handleConversations }).fetch(request(), env)).toBe(rejection)
    expect(handleConversations).not.toHaveBeenCalled()
  })

  it('fails closed until the real feature handlers are composed', async () => {
    const { env, run } = setup()
    const response = await createAppHandler().fetch(request(), env)
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: { code: 'AUTH_NOT_CONFIGURED', message: 'Saved conversations are not available yet.' } })
    expect(run).not.toHaveBeenCalled()
  })

  it.each(['auth', 'conversations'])('sanitizes an unexpected %s failure', async (source) => {
    const { env, requireUser, handleConversations } = setup()
    const failingHandler = source === 'auth' ? requireUser : handleConversations
    failingHandler.mockRejectedValueOnce(new Error('private upstream diagnostic'))
    const response = await createAppHandler({ requireUser, handleConversations }).fetch(request(), env)
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain('private upstream')
    expect(console.log).not.toHaveBeenCalled()
    if (source === 'auth') expect(handleConversations).not.toHaveBeenCalled()
  })

  it('does not retain another request’s identity when verification finishes out of order', async () => {
    const { env, requireUser, handleConversations } = setup()
    let resolveFirst!: (user: typeof student) => void
    requireUser.mockReturnValueOnce(new Promise(resolve => { resolveFirst = resolve }))
      .mockResolvedValueOnce({ id: 'student-b', email: null })
    const app = createAppHandler({ requireUser, handleConversations })
    const first = app.fetch(request('/api/conversations/first/messages'), env)
    await app.fetch(request('/api/conversations/second/messages'), env)
    resolveFirst(student)
    await first
    expect(handleConversations.mock.calls.map(call => [new URL(call[0].url).pathname, call[2].id])).toEqual([
      ['/api/conversations/second/messages', 'student-b'],
      ['/api/conversations/first/messages', 'student-a'],
    ])
  })

  it('keeps legacy team authorization working for the existing coach', async () => {
    const { env, run } = setup()
    const response = await createAppHandler().fetch(new Request('https://coach.example/api/coach', {
      method: 'POST', headers: { Authorization: 'Bearer test-only-team', 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Help me study' }] }),
    }), env)
    expect(response.status).toBe(200)
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('accepts the separate team header without replacing the student bearer', async () => {
    const { env } = setup()
    const response = await createAppHandler().fetch(request('/api/health'), env)
    expect(response.status).toBe(200)
    expect((await response.json() as { capabilities: unknown }).capabilities).toEqual({ images: true })
    expect((await createAppHandler().fetch(request('/api/health', {
      'X-Team-Token': 'wrong-team', Authorization: 'Bearer test-only-team',
    }), env)).status).toBe(401)
  })

  it('does not mistake a similarly named endpoint for conversation routes', async () => {
    const { env, requireUser, handleConversations } = setup()
    expect((await createAppHandler({ requireUser, handleConversations }).fetch(request('/api/conversations-other'), env)).status).toBe(404)
    expect(requireUser).not.toHaveBeenCalled()
  })
})
