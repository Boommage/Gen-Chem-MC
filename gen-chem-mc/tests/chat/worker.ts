// Local integration fixture only. Production worker.ts never imports this file.
import { createAppHandler } from '../../backend/app.ts'
import { handleConversations } from '../../backend/conversations/routes.ts'
import { failure } from '../../backend/http.ts'
import type { WorkerEnv } from '../../backend/env.ts'

const failures = new Set<string>()
const app = createAppHandler({
  requireUser: async request => {
    const token = request.headers.get('Authorization')
    return token === 'Bearer local-test-a' || token === 'Bearer local-test-b'
      ? { id: token.slice(7), email: null } : failure('UNAUTHORIZED', 'Use a local test account.', 401)
  },
  handleConversations,
})

export default {
  async fetch(request: Request, bindings: Omit<WorkerEnv, 'AI'>) {
    if (!['127.0.0.1', 'localhost'].includes(new URL(request.url).hostname)) return failure('LOCAL_ONLY', 'Local test fixture only.', 403)
    const env: WorkerEnv = {
      ...bindings,
      AI: {
        async run(_model, input) {
          const content = input.messages.at(-1)?.content ?? ''
          const text = typeof content === 'string' ? content : content.filter(part => part.type === 'text').map(part => part.text).join(' ')
          if (input.max_completion_tokens === 64) {
            const data = JSON.parse(text) as { student: string }
            return { choices: [{ message: { content: 'Local chat: ' + data.student.slice(0, 50) }, finish_reason: 'stop' }] }
          }
          await new Promise(resolve => setTimeout(resolve, 650))
          const key = request.headers.get('Authorization') + ':' + text
          if (text.startsWith('[test failure]') && !failures.has(key)) {
            failures.add(key)
            throw new Error('Intentional local fixture outage')
          }
          return { choices: [{ message: { content: 'Local test reply: check **units** and $\\lambda$. What have you tried?' }, finish_reason: 'stop' }] }
        },
      },
    }
    if (new URL(request.url).pathname === '/__test__/cleanup' && request.method === 'POST'
      && request.headers.get('Authorization') === 'Bearer local-test-a') {
      await app.scheduled({} as ScheduledController, env)
      return Response.json({ status: 'ok' })
    }
    return app.fetch(request, env)
  },
}
