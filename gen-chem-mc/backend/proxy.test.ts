// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
import { createServer as createHttpServer } from 'node:http'
import { createServer, type ConfigEnv, type UserConfig } from 'vite'
import config from '../vite.config.ts'

const configure = config as (env: ConfigEnv) => UserConfig
afterEach(() => vi.unstubAllEnvs())

it('builds without a team token because the development proxy is not bundled', () => {
  vi.stubEnv('COACH_API_URL', 'https://coach.example')
  vi.stubEnv('COACH_API_TOKEN', '')
  expect(configure({ mode: 'production', command: 'build' }).server).toBeUndefined()
})

it('requires a server-side token for shared live development', () => {
  vi.stubEnv('COACH_API_URL', 'https://coach.example')
  vi.stubEnv('COACH_API_TOKEN', '')
  expect(() => configure({ mode: 'development', command: 'serve' })).toThrow('COACH_API_TOKEN')
})

it('uses the token only in the upstream proxy header', () => {
  vi.stubEnv('COACH_API_URL', 'https://coach.example')
  vi.stubEnv('COACH_API_TOKEN', 'test-only-token')
  const result = configure({ mode: 'development', command: 'serve' })
  expect(result.server?.proxy?.['/api']).toMatchObject({ target: 'https://coach.example', headers: { 'X-Team-Token': 'test-only-token' } })
  expect(result.define).toBeUndefined()
})

it('forwards student authorization and keeps the legacy fallback off saved-data routes', async () => {
  const upstream = createHttpServer((request, response) => {
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ authorization: request.headers.authorization ?? null, team: request.headers['x-team-token'] ?? null }))
  })
  await new Promise<void>(resolve => upstream.listen(0, '127.0.0.1', resolve))
  const upstreamAddress = upstream.address()
  if (!upstreamAddress || typeof upstreamAddress === 'string') throw new Error('Test upstream did not start')
  vi.stubEnv('COACH_API_URL', `http://127.0.0.1:${upstreamAddress.port}`)
  vi.stubEnv('COACH_API_TOKEN', 'test-only-team')
  let frontend: Awaited<ReturnType<typeof createServer>> | undefined
  try {
    const configured = configure({ mode: 'development', command: 'serve' })
    frontend = await createServer({ ...configured, configFile: false, server: { ...configured.server, port: 0, strictPort: false } })
    await frontend.listen()
    const frontendAddress = frontend.httpServer?.address()
    if (!frontendAddress || typeof frontendAddress === 'string') throw new Error('Test frontend did not start')
    const origin = `http://127.0.0.1:${frontendAddress.port}`
    expect(await (await fetch(origin + '/api/conversations', {
      headers: { Authorization: 'Bearer test-only-student', 'X-Team-Token': 'browser-must-not-choose-team' },
    })).json()).toEqual({ authorization: 'Bearer test-only-student', team: 'test-only-team' })
    expect(await (await fetch(origin + '/api/coach', { headers: { Authorization: 'Bearer test-only-student' } })).json())
      .toEqual({ authorization: 'Bearer test-only-student', team: 'test-only-team' })
    expect(await (await fetch(origin + '/api/coach')).json()).toEqual({ authorization: 'Bearer test-only-team', team: 'test-only-team' })
    expect(await (await fetch(origin + '/api/health?check=1')).json()).toEqual({ authorization: 'Bearer test-only-team', team: 'test-only-team' })
    expect(await (await fetch(origin + '/api/conversations/a/messages')).json()).toEqual({ authorization: null, team: 'test-only-team' })
  } finally {
    await frontend?.close()
    upstream.closeAllConnections()
    await new Promise<void>((resolve, reject) => upstream.close(error => error ? reject(error) : resolve()))
  }
})

it('rejects unencrypted remote backend addresses', () => {
  vi.stubEnv('COACH_API_URL', 'http://coach.example')
  vi.stubEnv('COACH_API_TOKEN', 'test-only-token')
  expect(() => configure({ mode: 'development', command: 'serve' })).toThrow('HTTPS')
})

it.each(['http://127.0.0.1:5173/', 'http://localhost:5173/'])('rejects pointing the coach proxy back at the frontend: %s', (url) => {
  vi.stubEnv('COACH_API_URL', url)
  vi.stubEnv('COACH_API_TOKEN', '')
  expect(() => configure({ mode: 'development', command: 'serve' })).toThrow('points to the frontend')
})

it('rejects a frontend/API path in the backend origin', () => {
  vi.stubEnv('COACH_API_URL', 'https://coach.example/api/coach')
  vi.stubEnv('COACH_API_TOKEN', 'test-only-token')
  expect(() => configure({ mode: 'development', command: 'serve' })).toThrow('origin only')
})
