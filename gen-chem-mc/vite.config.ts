import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode, command }) => {
  // A static build does not use the dev proxy or require a development token.
  if (command === 'build') return { plugins: [react()] }
  // No VITE_ prefix: these values belong to the local server, not the browser.
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.COACH_API_URL || 'http://127.0.0.1:8787'
  const url = new URL(target)
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  if (local && url.port === '5173') throw new Error('COACH_API_URL points to the frontend. Use the deployed Worker URL, or http://127.0.0.1:8787 for a local backend.')
  if (url.pathname !== '/' || url.search || url.hash || url.username || url.password) throw new Error('COACH_API_URL must be the backend origin only, without a path, query, or credentials.')
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) throw new Error('COACH_API_URL must use HTTPS, or HTTP on localhost.')
  if (!local && !env.COACH_API_TOKEN) throw new Error('Shared coach mode requires COACH_API_TOKEN in .env.local. Ask the team endpoint owner for it.')
  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          headers: env.COACH_API_TOKEN ? { Authorization: `Bearer ${env.COACH_API_TOKEN}` } : undefined,
        },
      },
    },
  }
})
