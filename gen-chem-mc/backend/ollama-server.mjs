
import { createServer } from 'node:http'

const PORT = 8788
const HOST = '127.0.0.1'
const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    ...corsHeaders,
    'Content-Type': 'application/json',
  })
  res.end(JSON.stringify(data))
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders)
    res.end()
    return
  }

  if (req.method !== 'POST' || req.url !== '/') {
    sendJson(res, 404, { error: 'Endpoint not found' })
    return
  }

  try {
    let rawBody = ''

    for await (const chunk of req) {
      rawBody += chunk
      if (rawBody.length > 100_000) {
        sendJson(res, 413, { error: 'Request too large' })
        return
      }
    }

    const body = JSON.parse(rawBody)

    if (
      !Array.isArray(body.messages) ||
      body.messages.length === 0 ||
      body.messages.length > 40 ||
      !body.messages.every(
        (m) =>
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' &&
          m.content.length <= 10_000
      )
    ) {
      sendJson(res, 400, { error: 'Invalid messages' })
      return
    }

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'genchem-tutor',
        messages: body.messages,
        stream: false,
      }),
      signal: AbortSignal.timeout(120_000),
    })

    if (!response.ok) {
      throw new Error(`Ollama returned HTTP ${response.status}`)
    }

    const data = await response.json()
    const content = data.message?.content

    if (typeof content !== 'string') {
      throw new Error('Invalid Ollama response')
    }

    // Never display model reasoning to students.
    // Reject responses containing thinking markers.
    if (/<\/?think>/i.test(content)) {
      sendJson(res, 502, {
        error: 'Model returned an unexpected response. Please retry.',
      })
      return
    }

    // Match the response format expected by Coach.tsx.
    sendJson(res, 200, {
      choices: [
        {
          message: {
            role: 'assistant',
            content,
          },
        },
      ],
    })
  } catch (error) {
    console.error('Ollama backend error:', error)

    sendJson(res, 500, {
      error: 'Unable to reach the local AI tutor.',
    })
  }
})

server.listen(PORT, HOST, () => {
  console.log(`Gen Chem tutor API running at http://localhost:${PORT}`)
})
