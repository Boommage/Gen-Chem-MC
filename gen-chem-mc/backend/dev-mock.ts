import { createServer } from 'node:http'
import { createHandler, GEMMA_MODEL, MAX_BODY_BYTES, type Env } from './model.ts'

const env: Env = {
  AI: {
    async run(_model, input) {
      await new Promise((resolve) => setTimeout(resolve, 900))
      const content = input.messages.at(-1)?.content ?? ''
      const last = typeof content === 'string' ? content : content.filter(part => part.type === 'text').map(part => 'text' in part ? part.text : '').join(' ')
      const hasImage = Array.isArray(content) && content.some(part => part.type === 'image_url')
      const reply = hasImage ? 'Mock preview: an image was attached. Which information in it seems relevant, and what have you tried?'
        : /study|reflect|exam|habit/i.test(last)
        ? 'What did you try during your last study session, and what helped you check your understanding?'
        : 'What information does the problem give you, and what have you tried so far?'
      return { choices: [{ message: { content: reply }, finish_reason: 'stop' }] }
    },
  },
}

const handler = createHandler()
const server = createServer(async (incoming, outgoing) => {
  try {
    const chunks: Buffer[] = []
    let bytes = 0
    for await (const chunk of incoming) {
      bytes += chunk.length
      if (bytes > MAX_BODY_BYTES) {
        outgoing.writeHead(413, { 'Content-Type': 'application/json' })
        outgoing.end(JSON.stringify({ error: { message: 'The message is too large.' } }))
        return
      }
      chunks.push(Buffer.from(chunk))
    }
    const headers = new Headers()
    for (const [key, value] of Object.entries(incoming.headers)) {
      if (typeof value === 'string') headers.set(key, value)
    }
    const request = new Request('http://127.0.0.1:8787' + incoming.url, {
      method: incoming.method,
      headers,
      ...(chunks.length ? { body: Buffer.concat(chunks) } : {}),
    })
    const response = await handler.fetch(request, env)
    const body: unknown = await response.json()
    outgoing.writeHead(response.status, Object.fromEntries(response.headers))
    outgoing.end(JSON.stringify(response.ok && body && typeof body === 'object' ? { ...body, preview: true } : body))
  } catch {
    outgoing.writeHead(500, { 'Content-Type': 'application/json' })
    outgoing.end(JSON.stringify({ error: { message: 'The local mock could not handle this request.' } }))
  }
})

server.on('error', () => {
  console.error('Mock server could not start. Check that port 8787 is free.')
  process.exitCode = 1
})
server.listen(8787, '127.0.0.1', () => {
  console.info('Mock coach at http://127.0.0.1:8787 — canned responses, not live ' + GEMMA_MODEL)
})
