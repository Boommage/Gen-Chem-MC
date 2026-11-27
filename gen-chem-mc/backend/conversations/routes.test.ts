// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { WorkerEnv } from '../env.ts'
import { createAppHandler } from '../app.ts'
import { failure } from '../http.ts'
import { handleConversations } from './routes.ts'
import { cleanupConversations } from './cleanup.ts'
import { IMAGE_BUDGET } from './attachments.ts'
import { PNG_IMAGE } from '../../shared/imageFixtures.ts'
import { testDatabase } from './testDatabase.ts'

const id = (n: number) => `00000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`
let storage: ReturnType<typeof testDatabase>
let env: WorkerEnv
let run: ReturnType<typeof vi.fn<WorkerEnv['AI']['run']>>
let app: ReturnType<typeof createAppHandler>
let objects: Map<string, Uint8Array>
let put: ReturnType<typeof vi.fn>
let get: ReturnType<typeof vi.fn>
let remove: ReturnType<typeof vi.fn>
const first = (n = 1, content = 'Help me study', image?: typeof PNG_IMAGE) => ({ id: id(n), firstTurn: { clientTurnId: id(n + 1000), content, ...(image ? { image } : {}) } })
async function call(path = '', method = 'GET', value?: unknown, owner = 'a') {
  return app.fetch(new Request('http://localhost/api/conversations' + path, {
    method, headers: { Authorization: `Bearer ${owner}`, 'Content-Type': 'application/json' },
    ...(value === undefined ? {} : { body: JSON.stringify(value) }),
  }), env)
}
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  storage = testDatabase()
  run = vi.fn<WorkerEnv['AI']['run']>().mockImplementation(async (_model, input) => ({ choices: [{ message: { content: input.max_completion_tokens === 64 ? 'Exam study planning' : 'What have you tried?' }, finish_reason: 'stop' }] }))
  objects = new Map()
  put = vi.fn(async (key: string, value: Uint8Array) => { objects.set(key, value); return {} })
  get = vi.fn(async (key: string) => {
    const value = objects.get(key)
    return value ? { size: value.length, arrayBuffer: async () => value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) } : null
  })
  remove = vi.fn(async (key: string) => { objects.delete(key) })
  env = { AI: { run }, DB: storage.db, CHAT_IMAGES: { put, get, delete: remove } as unknown as R2Bucket, CHAT_IMAGE_STORAGE_ENABLED: 'true' }
  app = createAppHandler({
    requireUser: async request => {
      const token = request.headers.get('Authorization')
      return token === 'Bearer a' || token === 'Bearer b' ? { id: token.slice(7), email: null } : failure('UNAUTHORIZED', 'Sign in.', 401)
    },
    handleConversations,
  })
})
afterEach(() => { storage.sqlite.close(); vi.restoreAllMocks() })

describe('saved chat HTTP integration', () => {
  it('atomically saves the first turn, generates a title, resumes and follows up with stored context', async () => {
    const created = await call('', 'POST', first())
    expect(created.status).toBe(200)
    expect(await created.json()).toMatchObject({ conversation: { id: id(1), title: 'Exam study planning' }, turn: { status: 'completed', messages: [{ role: 'user' }, { role: 'assistant' }] } })
    expect((await (await call()).json() as { conversations: unknown[] }).conversations).toHaveLength(1)
    const page = await (await call(`/${id(1)}/messages`)).json() as { messages: { content: string }[] }
    expect(page.messages.map(m => m.content)).toEqual(['Help me study', 'What have you tried?'])
    expect((await call(`/${id(1)}/turns`, 'POST', { clientTurnId: id(2001), content: 'I checked the units' })).status).toBe(200)
    expect(run.mock.calls.at(-1)?.[1].messages.slice(1).map(m => m.content)).toEqual(['Help me study', 'What have you tried?', 'I checked the units'])
    expect(run).toHaveBeenCalledTimes(3)
  })

  it('replays creation and completed sends without additional messages or model calls', async () => {
    await call('', 'POST', first())
    expect((await call('', 'POST', first())).status).toBe(200)
    const repeat = await call(`/${id(1)}/turns`, 'POST', first().firstTurn)
    expect((await repeat.json() as { status: string }).status).toBe('completed')
    expect(run).toHaveBeenCalledTimes(2)
    expect(storage.sqlite.prepare('SELECT COUNT(*) AS count FROM messages').get()?.count).toBe(2)
    expect((await call('', 'POST', first(1, 'Different input'))).status).toBe(409)
  })

  it('saves failures for Retry and excludes failed earlier turns from new inference context', async () => {
    run.mockRejectedValueOnce(new Error('private diagnostic'))
    const failed = await call('', 'POST', first())
    expect(failed.status).toBe(503)
    expect(await failed.text()).not.toContain('private')
    const recovered = await (await call(`/${id(1)}/turns/${id(1001)}`)).json()
    expect(recovered).toMatchObject({ status: 'failed', messages: [{ role: 'user', turnStatus: 'failed' }] })
    expect((await call('', 'POST', first())).status).toBe(200)
    expect(storage.sqlite.prepare('SELECT COUNT(*) AS count FROM messages').get()?.count).toBe(2)
    run.mockRejectedValueOnce(new Error('failed follow-up'))
    await call(`/${id(1)}/turns`, 'POST', { clientTurnId: id(2002), content: 'Failed question' })
    await call(`/${id(1)}/turns`, 'POST', { clientTurnId: id(2003), content: 'A different question' })
    expect(run.mock.calls.at(-1)?.[1].messages.map(m => m.content)).not.toContain('Failed question')
  })

  it('refuses other owners, including attachment guesses, before model or storage access', async () => {
    await call('', 'POST', first(1, 'Check this image', PNG_IMAGE))
    const attachment = storage.sqlite.prepare('SELECT id FROM attachments').get()?.id
    const before = { run: run.mock.calls.length, get: get.mock.calls.length, put: put.mock.calls.length }
    expect(await (await call('', 'GET', undefined, 'b')).json()).toEqual({ conversations: [], nextCursor: null })
    for (const path of [`/${id(1)}/messages`, `/${id(1)}/turns/${id(1001)}`, `/${id(1)}/attachments/${attachment}`]) {
      const response = await call(path, 'GET', undefined, 'b')
      expect(response.status).toBe(404)
      expect(await response.json()).toEqual({ error: { code: 'NOT_FOUND', message: 'This conversation or item is unavailable.' } })
    }
    expect((await call(`/${id(1)}/turns`, 'POST', { clientTurnId: id(2010), content: 'Hijack' }, 'b')).status).toBe(404)
    expect((await call('', 'POST', first(), 'b')).status).toBe(404)
    expect(run).toHaveBeenCalledTimes(before.run)
    expect(get).toHaveBeenCalledTimes(before.get)
    expect(put).toHaveBeenCalledTimes(before.put)
  })

  it('keeps authenticated image bytes private and retains image context in follow-ups', async () => {
    await call('', 'POST', first(1, 'Check this image', PNG_IMAGE))
    const attachment = storage.sqlite.prepare('SELECT id FROM attachments').get()?.id
    const response = await call(`/${id(1)}/attachments/${attachment}`)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/png')
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(0)
    await call(`/${id(1)}/turns`, 'POST', { clientTurnId: id(2011), content: 'What should I inspect next?' })
    expect(run.mock.calls.at(-1)?.[1].messages[1].content).toEqual([{ type: 'text', text: 'Check this image' }, { type: 'image_url', image_url: { url: PNG_IMAGE.dataUrl } }])
    expect(put).toHaveBeenCalledTimes(1)
  })

  it('refuses images when not configured and never falls back to stateless inference', async () => {
    env.CHAT_IMAGE_STORAGE_ENABLED = 'false'
    expect((await call('', 'POST', first(1, 'Check image', PNG_IMAGE))).status).toBe(503)
    expect(run).not.toHaveBeenCalled()
    expect(put).not.toHaveBeenCalled()
    expect(storage.sqlite.prepare('SELECT COUNT(*) AS count FROM conversations').get()?.count).toBe(0)
  })

  it('refuses expired conversations immediately and deletes their images through scheduled cleanup', async () => {
    await call('', 'POST', first(1, 'Check image', PNG_IMAGE))
    storage.sqlite.prepare("UPDATE conversations SET expires_at = '2000-01-01T00:00:00.000Z'").run()
    expect((await call(`/${id(1)}/messages`)).status).toBe(404)
    expect(await (await call()).json()).toEqual({ conversations: [], nextCursor: null })
    await cleanupConversations(env)
    expect(objects.size).toBe(0)
    expect(storage.sqlite.prepare('SELECT COUNT(*) AS count FROM conversations').get()?.count).toBe(0)
    expect(storage.sqlite.prepare('SELECT COUNT(*) AS count FROM image_deletions').get()?.count).toBe(0)
    expect(storage.sqlite.prepare('SELECT upload_bytes FROM r2_usage').get()?.upload_bytes).toBeGreaterThan(0)
  })

  it('stops image calls at the application budget and retains reservations after an uncertain upload', async () => {
    storage.sqlite.prepare('UPDATE r2_usage SET class_a = ?').run(IMAGE_BUDGET.classA)
    expect((await call('', 'POST', first(1, 'Check image', PNG_IMAGE))).status).toBe(429)
    expect(put).not.toHaveBeenCalled()
    expect((await call('', 'POST', first(2))).status).toBe(200)
    storage.sqlite.prepare('UPDATE r2_usage SET class_a = 0').run()
    put.mockRejectedValueOnce(new Error('private storage details'))
    expect((await call('', 'POST', first(3, 'Check image', PNG_IMAGE))).status).toBe(503)
    expect(storage.sqlite.prepare('SELECT class_a, upload_bytes FROM r2_usage').get()).toMatchObject({ class_a: 1, upload_bytes: expect.any(Number) })
    expect(storage.sqlite.prepare('SELECT state FROM image_objects').get()?.state).toBe('reserved')
  })

  it('rejects invalid IDs, payloads, image bytes and pagination cursors without inference', async () => {
    expect((await call('', 'POST', { id: 'bad', firstTurn: first().firstTurn })).status).toBe(400)
    expect((await call('', 'POST', { id: id(1), firstTurn: { clientTurnId: id(1001), content: ' ' } })).status).toBe(400)
    expect((await call('', 'POST', { id: id(1), firstTurn: { ...first().firstTurn, image: { name: 'x', dataUrl: 'https://private.example' } } })).status).toBe(400)
    expect((await call('?cursor=bad')).status).toBe(400)
    expect(run).not.toHaveBeenCalled()
  })

  it('returns pending for a duplicate while a response is running and refuses another turn', async () => {
    let resolve!: (value: unknown) => void
    run.mockImplementationOnce(() => new Promise(done => { resolve = done }))
    const original = call('', 'POST', first())
    await vi.waitFor(() => expect(run).toHaveBeenCalledTimes(1))
    const duplicate = await call('', 'POST', first())
    expect(duplicate.status).toBe(202)
    expect((await duplicate.json() as { turn: { status: string } }).turn.status).toBe('pending')
    expect((await call(`/${id(1)}/turns`, 'POST', { clientTurnId: id(2012), content: 'Second tab' })).status).toBe(409)
    resolve({ choices: [{ message: { content: 'What have you tried?' } }] })
    expect((await original).status).toBe(200)
    expect(storage.sqlite.prepare('SELECT COUNT(*) AS count FROM messages').get()?.count).toBe(2)
  })

  it('recovers an interrupted attempt and prevents its late reply from overwriting the retry', async () => {
    let resolve!: (value: unknown) => void
    run.mockImplementationOnce(() => new Promise(done => { resolve = done }))
    const original = call('', 'POST', first())
    await vi.waitFor(() => expect(run).toHaveBeenCalledTimes(1))
    storage.sqlite.prepare("UPDATE turns SET attempt_started_at = '2000-01-01T00:00:00.000Z'").run()
    const interrupted = await (await call(`/${id(1)}/turns/${id(1001)}`)).json()
    expect(interrupted).toMatchObject({ status: 'failed', error: { code: 'INTERRUPTED' } })
    expect((await call('', 'POST', first())).status).toBe(200)
    resolve({ choices: [{ message: { content: 'Late reply must not be stored' } }] })
    await original
    expect(storage.sqlite.prepare("SELECT content FROM messages WHERE role = 'assistant'").all()).toEqual([{ content: 'What have you tried?' }])
  })

  it('paginates conversations with tied timestamps and messages without duplicates or owner leakage', async () => {
    for (let n = 1; n <= 22; n++) await call('', 'POST', first(n))
    storage.sqlite.prepare("UPDATE conversations SET updated_at = '2026-11-27T00:00:00.000Z'").run()
    const page1 = await (await call()).json() as { conversations: { id: string }[]; nextCursor: string }
    const page2 = await (await call('?cursor=' + encodeURIComponent(page1.nextCursor))).json() as { conversations: { id: string }[]; nextCursor: null }
    expect(page1.conversations).toHaveLength(20)
    expect(page2.conversations).toHaveLength(2)
    expect(new Set([...page1.conversations, ...page2.conversations].map(c => c.id)).size).toBe(22)
    expect(page2.nextCursor).toBeNull()
    expect(await (await call('?cursor=' + encodeURIComponent(page1.nextCursor), 'GET', undefined, 'b')).json()).toEqual({ conversations: [], nextCursor: null })
    for (let n = 1; n <= 26; n++) await call(`/${id(1)}/turns`, 'POST', { clientTurnId: id(3000 + n), content: 'Follow-up ' + n })
    const messages1 = await (await call(`/${id(1)}/messages`)).json() as { messages: { id: string }[]; nextCursor: string }
    const messages2 = await (await call(`/${id(1)}/messages?cursor=` + encodeURIComponent(messages1.nextCursor))).json() as { messages: { id: string }[] }
    expect(messages1.messages).toHaveLength(50)
    expect(messages2.messages).toHaveLength(4)
    expect(new Set([...messages1.messages, ...messages2.messages].map(m => m.id)).size).toBe(54)
    expect(run.mock.calls.filter(call => call[1].max_completion_tokens === 1024).every(call => call[1].messages.length <= 22)).toBe(true)
  })

  it('keeps a successful reply when title generation fails and logs safe title usage only', async () => {
    run.mockResolvedValueOnce({ choices: [{ message: { content: 'What have you tried?' } }] })
      .mockRejectedValueOnce(new Error('private title service diagnostic'))
    const response = await call('', 'POST', first())
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ conversation: { title: 'New chat' }, turn: { status: 'completed' } })
    const titleRequest = run.mock.calls[1][1]
    expect(titleRequest.chat_template_kwargs).toEqual({ enable_thinking: false })
    expect(titleRequest.max_completion_tokens).toBe(64)
    expect(JSON.stringify(vi.mocked(console.log).mock.calls)).not.toContain('private')
    expect(vi.mocked(console.log).mock.calls.at(-1)?.[0]).toMatchObject({ purpose: 'title', outcome: 'provider_error' })
  })

  it('enforces read, storage-byte and per-student upload limits before object calls', async () => {
    await call('', 'POST', first(1, 'Check image', PNG_IMAGE))
    const attachment = storage.sqlite.prepare('SELECT id FROM attachments').get()?.id
    storage.sqlite.prepare('UPDATE r2_usage SET class_b = ?').run(IMAGE_BUDGET.classB)
    expect((await call(`/${id(1)}/attachments/${attachment}`)).status).toBe(429)
    expect(get).not.toHaveBeenCalled()
    storage.sqlite.prepare('UPDATE r2_usage SET upload_bytes = ?').run(IMAGE_BUDGET.bytes)
    expect((await call('', 'POST', first(2, 'Check image', PNG_IMAGE))).status).toBe(429)
    storage.sqlite.prepare('UPDATE r2_usage SET upload_bytes = 0').run()
    storage.sqlite.prepare('UPDATE image_rate_limits SET uploads = ?').run(IMAGE_BUDGET.uploadsPerDay)
    expect((await call('', 'POST', first(3, 'Check image', PNG_IMAGE))).status).toBe(429)
    expect(put).toHaveBeenCalledTimes(1)
  })

  it('atomically grants only the last available upload reservation to concurrent requests', async () => {
    storage.sqlite.prepare('UPDATE r2_usage SET class_a = ?').run(IMAGE_BUDGET.classA - 1)
    const responses = await Promise.all([call('', 'POST', first(1, 'Image A', PNG_IMAGE)), call('', 'POST', first(2, 'Image B', PNG_IMAGE))])
    expect(responses.map(response => response.status).sort()).toEqual([200, 429])
    expect(put).toHaveBeenCalledTimes(1)
    expect(storage.sqlite.prepare('SELECT class_a FROM r2_usage').get()?.class_a).toBe(IMAGE_BUDGET.classA)
  })

  it('keeps deletion failures queued and does not renew retention on retries or title changes', async () => {
    await call('', 'POST', first(1, 'Check image', PNG_IMAGE))
    const expiry = storage.sqlite.prepare('SELECT expires_at FROM conversations').get()?.expires_at
    await call('', 'POST', first(1, 'Check image', PNG_IMAGE))
    expect(storage.sqlite.prepare('SELECT expires_at FROM conversations').get()?.expires_at).toBe(expiry)
    storage.sqlite.prepare("UPDATE conversations SET expires_at = '2000-01-01T00:00:00.000Z'").run()
    remove.mockRejectedValueOnce(new Error('private delete diagnostic'))
    await cleanupConversations(env)
    expect(storage.sqlite.prepare('SELECT COUNT(*) AS count FROM image_deletions').get()?.count).toBe(1)
    await cleanupConversations(env)
    expect(storage.sqlite.prepare('SELECT COUNT(*) AS count FROM image_deletions').get()?.count).toBe(0)
  })
})
