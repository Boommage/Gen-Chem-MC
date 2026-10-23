
import { createServer } from 'node:http'
import { GoogleGenAI } from '@google/genai'
import { TUTOR_PROMPT } from './tutor-prompt.mjs'

const HOST = '127.0.0.1'
const PORT = 8788
const MODEL = process.env.TUTOR_MODEL || 'gemini-3.8-flash'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is missing')
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

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
          m.content.length > 0 &&
          m.content.length <= 10000
      ) ||
      body.messages.at(-1).role !== 'user'
    ) {
      sendJson(res, 400, { error: 'Invalid messages' })
      return
    }

    const contents = body.messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }))

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: TUTOR_PROMPT,
        maxOutputTokens: 500,
      },
    })

    const content = response.text

    if (!content) {
      throw new Error('Gemini returned no text')
    }

    sendJson(res, 200, {
      choices: [{
        message: {
          role: 'assistant',
          content,
        },
      }],
    })
  } catch (error) {
    console.error('Gemini tutor error:', error)

    sendJson(res, 502, {
      error: 'Unable to get a response from Gemini.',
    })
  }
})

server.listen(PORT, HOST, () => {
  console.log(`GET CHEM Gemini tutor running at http://${HOST}:${PORT}`)
})
