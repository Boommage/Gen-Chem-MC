import { afterEach, expect, it, vi } from 'vitest'
import { apiRequest, ApiError } from './api'

afterEach(() => vi.unstubAllGlobals())

it('sends the current student token, JSON, and cancellation signal to the same-origin API', async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ conversations: [] }))
  vi.stubGlobal('fetch', fetchMock)
  const signal = new AbortController().signal
  expect(await apiRequest('/api/conversations', 'test-only-student', {
    method: 'POST', body: JSON.stringify({ id: 'conversation-a' }), signal,
    headers: { 'X-Request-Id': 'request-a', authorization: 'old-token' },
  })).toEqual({ conversations: [] })
  const [path, init] = fetchMock.mock.calls[0]
  expect(path).toBe('/api/conversations')
  expect(init.signal).toBe(signal)
  expect(init.redirect).toBe('error')
  expect(Object.fromEntries(init.headers)).toEqual({ authorization: 'Bearer test-only-student', 'content-type': 'application/json', 'x-request-id': 'request-a' })
})

it('leaves multipart content type to the browser', async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ id: 'attachment-a' }))
  vi.stubGlobal('fetch', fetchMock)
  await apiRequest('/api/conversations/a/attachments', 'test-only-student', { method: 'POST', body: new FormData() })
  expect(fetchMock.mock.calls[0][1].headers.has('Content-Type')).toBe(false)
})

it('does not label plain text as JSON or overwrite an explicit content type', async () => {
  const fetchMock = vi.fn().mockImplementation(async () => Response.json({ ok: true }))
  vi.stubGlobal('fetch', fetchMock)
  await apiRequest('/api/conversations', 'test-only-student', { method: 'POST', body: 'plain text' })
  expect(fetchMock.mock.calls[0][1].headers.has('Content-Type')).toBe(false)
  await apiRequest('/api/conversations', 'test-only-student', { method: 'POST', body: '{}', headers: { 'Content-Type': 'text/plain' } })
  expect(fetchMock.mock.calls[1][1].headers.get('Content-Type')).toBe('text/plain')
})

it.each(['https://other.example/api/chat', '//other.example/api/chat', '/api/../other', '/api/%2e%2e/other', '/api/%5c/other', '/api/a/../../other', '/api/%'])('refuses credential-bearing requests to an invalid path: %s', async (path) => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  await expect(apiRequest(path, 'test-only-student')).rejects.toMatchObject({ code: 'INVALID_PATH' })
  expect(fetchMock).not.toHaveBeenCalled()
})

it('refuses an empty access token before making a request', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  await expect(apiRequest('/api/conversations', ' ')).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
  expect(fetchMock).not.toHaveBeenCalled()
})

it('preserves the shared safe error envelope and makes no automatic POST retry', async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ error: { code: 'CONFLICT', message: 'This turn is already running.' } }, { status: 409 }))
  vi.stubGlobal('fetch', fetchMock)
  await expect(apiRequest('/api/conversations/a/turns', 'test-only-student', { method: 'POST' })).rejects.toMatchObject({ status: 409, code: 'CONFLICT', message: 'This turn is already running.' })
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

it.each([
  new Response('<html>private gateway error</html>', { status: 502 }),
  Response.json({ error: 'private malformed error' }, { status: 503 }),
  Response.json({ error: { code: {}, message: 'private malformed error' } }, { status: 503 }),
])('provides a usable error for nonstandard upstream failures', async (response) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
  const error = await apiRequest('/api/conversations', 'test-only-student').catch(error => error)
  expect(error).toBeInstanceOf(ApiError)
  expect(error.status).toBe(response.status)
  expect(error.message).toContain(`HTTP ${response.status}`)
  expect(error.message).not.toContain('private')
})

it('rejects an empty successful response unless its status is 204', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('')).mockResolvedValueOnce(new Response(null, { status: 204 })))
  await expect(apiRequest('/api/conversations', 'test-only-student')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  expect(await apiRequest('/api/conversations/a', 'test-only-student', { method: 'DELETE' })).toBeUndefined()
})

it('sanitizes network errors without losing cancellation', async () => {
  const cancelled = new DOMException('The operation was aborted.', 'AbortError')
  vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('private upstream address')).mockRejectedValueOnce(cancelled))
  await expect(apiRequest('/api/conversations', 'test-only-student')).rejects.toMatchObject({ code: 'NETWORK_ERROR', message: 'The server could not be reached. Please retry.' })
  await expect(apiRequest('/api/conversations', 'test-only-student')).rejects.toBe(cancelled)
})
