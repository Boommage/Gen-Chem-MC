import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { startChatRuntime } from './runtime.ts'

const root = fileURLToPath(new URL('../../', import.meta.url))
const runtime = await startChatRuntime(resolve(root, '.wrangler/chat-local-test'))
let frontend
try {
  frontend = await createServer({ root, configFile: false, envDir: false, plugins: [react()],
    server: { host: '127.0.0.1', port: 5176, strictPort: true, proxy: { '/api': { target: runtime.origin.origin, changeOrigin: true } } } })
  await frontend.listen()
  console.info('Local integration test: http://127.0.0.1:5176/tests/chat/index.html')
  console.info('Local D1/R2 only; canned model; fabricated test accounts. No Cloudflare login or live inference.')
  console.info('Local test data persists in .wrangler/chat-local-test. Production configuration is not loaded.')
} catch {
  await frontend?.close()
  await runtime.close()
  console.error('The local chat test could not start. Check that port 5176 is free.')
  process.exitCode = 1
}
let stopping = false
async function stop() {
  if (stopping) return
  stopping = true
  await frontend?.close()
  await runtime.close()
}
process.on('SIGINT', () => { void stop() })
process.on('SIGTERM', () => { void stop() })
