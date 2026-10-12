// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
import type { ConfigEnv, UserConfig } from 'vite'
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
  expect(result.server?.proxy?.['/api']).toMatchObject({ target: 'https://coach.example', headers: { Authorization: 'Bearer test-only-token' } })
  expect(result.define).toBeUndefined()
})

it('rejects unencrypted remote backend addresses', () => {
  vi.stubEnv('COACH_API_URL', 'http://coach.example')
  vi.stubEnv('COACH_API_TOKEN', 'test-only-token')
  expect(() => configure({ mode: 'development', command: 'serve' })).toThrow('HTTPS')
})
