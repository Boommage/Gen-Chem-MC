// Coach backend: a Cloudflare Worker that guides students without giving answers.
// The model runs either on your own computer with Ollama (OLLAMA_URL in .dev.vars)
// or on Cloudflare Workers AI (WORKERS_AI_ACCOUNT_ID and WORKERS_AI_TOKEN in .dev.vars).
// Request:  POST { messages: [{ role: 'user' | 'assistant', content }] }, last message from the user
// Response: { reply, rewritten, model }  or  { error }

export interface Env {
  OLLAMA_URL?: string
  OLLAMA_MODEL?: string
  WORKERS_AI_ACCOUNT_ID?: string
  WORKERS_AI_TOKEN?: string
  COACH_MODEL?: string
}

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

// An error whose message is safe to show in the app (it never contains the token).
class ModelError extends Error {}

const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8-fast'
const DEFAULT_OLLAMA_MODEL = 'llama3.1:8b'
// Only the most recent messages go to the model, so long chats keep working and stay cheap.
const HISTORY_LIMIT = 20
const MAX_CONTENT_LENGTH = 4000

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const API_ERRORS: Record<number, string> = {
  400: 'Workers AI rejected the request. Check that WORKERS_AI_TOKEN in .dev.vars is copied correctly.',
  401: 'Workers AI rejected the token or account ID in .dev.vars.',
  403: 'Workers AI rejected the token or account ID in .dev.vars.',
  404: 'Workers AI could not find that account or model. Check WORKERS_AI_ACCOUNT_ID and COACH_MODEL.',
  429: 'The free daily Workers AI allowance is used up. It resets at 00:00 UTC.',
}

// Protection 1: the coach's rules, sent with every conversation.
const SYSTEM_PROMPT = `You are a study coach for first-year general chemistry students.
Your only job is to GUIDE students so they figure things out themselves.
You NEVER give answers. This applies to every question: facts, definitions,
concepts, formulas, and problems to solve.

How to respond to every chemistry question:
1. Never state the answer, a definition, a fact the student asked for, a numerical result,
   or a worked solution. Never do a step for the student.
2. Instead, reply with ONE short, relevant guiding question or a small hint that points
   the student toward the answer, such as:
   - breaking the question into a smaller piece they can answer
   - pointing them to where they can find it (the periodic table, their notes, the formula)
   - asking what they already know about it
3. Make the guidance specific to their question, not generic. Show you understood what they asked.
4. If the student is stuck after a hint, give a slightly bigger hint, but still not the answer.
5. If the student gives an answer, check it:
   - If it is correct, confirm it and ask them to explain how they got it.
   - If it is wrong, do not reveal the correct answer. Point them to the part to rethink.
6. If the student asks for the answer directly or says they are in a hurry,
   kindly refuse and ask a guiding question instead.

For messages that are not chemistry questions (study planning, feeling stuck,
reflecting on a study session), respond supportively and ask a question that helps
them think about their own approach.

Always be encouraging and never judgmental. Keep replies short (1-3 sentences).

Examples:
Student: What is H2O?
Coach: Let's break the formula down. Which element does the letter H stand for, and which does O stand for?

Student: What is a mole?
Coach: Good question to dig into. Think about the word "dozen": what does a dozen tell you about a group of things?

Student: How many moles are in 36 g of water? Just tell me.
Coach: I can't give you the answer, but you can get there. What do you need to know about water to turn grams into moles?`

// Protection 2: attached to the student's latest message before sending; the student never sees it.
const REMINDER =
  '\n\n[Coach reminder: do NOT give the answer, a definition, a fact they asked for, ' +
  'any calculated number, or any solution step. Reply with ONE short guiding question ' +
  'or hint that is specific to this question. If the student stated an answer, confirm ' +
  'it only if it is correct.]'

const REWRITE_REQUEST =
  '[Coach reminder: that reply gave away the answer. Rewrite it as ONE guiding question ' +
  'or hint specific to the question, without stating the answer, a definition, or any result.]'

// Protection 3: a second model call that checks each reply for a leaked answer.
const checkPrompt = (question: string, reply: string) => `You review replies from a chemistry study coach.
The coach must NEVER give answers. It may only ask guiding questions or give hints.

Student message:
${question}

Coach reply:
${reply}

Does the coach reply directly give away the answer to what the student asked? This includes
stating a definition or fact the student asked for, a calculated number, or a solution step.
Answer NO if the reply only asks guiding questions or gives hints without stating the answer.
Answer NO if the coach only confirms an answer the student already stated themselves.
Answer with exactly one word: YES or NO.`

const FALLBACK_REPLY =
  "Let's work through this together instead of jumping to the answer. " +
  'What do you already know about it, and which part feels unclear?'

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: corsHeaders })
}

const usesOllama = (env: Env) => Boolean(env.OLLAMA_URL?.trim())

function missingConfig(env: Env): string | null {
  if (usesOllama(env)) return null
  const missing = (['WORKERS_AI_ACCOUNT_ID', 'WORKERS_AI_TOKEN'] as const).filter((key) => !env[key]?.trim())
  return missing.length
    ? `Missing settings in gen-chem-mc/.dev.vars: set OLLAMA_URL to run locally, or ${missing.join(' and ')} for Cloudflare.`
    : null
}

function ask(env: Env, model: string, messages: ChatMessage[], temperature = 0.3, maxTokens = 256) {
  return usesOllama(env)
    ? askOllama(env, model, messages, temperature, maxTokens)
    : askWorkersAI(env, model, messages, temperature, maxTokens)
}

// Ollama's OpenAI-compatible chat endpoint on your own computer.
async function askOllama(env: Env, model: string, messages: ChatMessage[], temperature: number, maxTokens: number) {
  const response = await fetch(`${env.OLLAMA_URL!.trim().replace(/\/$/, '')}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: false }),
  }).catch(() => {
    throw new ModelError('Could not reach Ollama. Make sure the Ollama app is running.')
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    console.error(`Ollama request failed (${response.status}):`, JSON.stringify(data?.error ?? data))
    throw new ModelError(
      response.status === 404 ? `Ollama doesn't have ${model} yet. Run: ollama pull ${model}` : `Ollama request failed (${response.status}).`,
    )
  }

  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string') throw new ModelError('Ollama returned an unexpected response.')
  return text.trim()
}

async function askWorkersAI(env: Env, model: string, messages: ChatMessage[], temperature: number, maxTokens: number) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.WORKERS_AI_ACCOUNT_ID!.trim()}/ai/run/${model}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.WORKERS_AI_TOKEN!.trim()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, temperature, max_tokens: maxTokens }),
  }).catch(() => {
    throw new ModelError('Could not reach Cloudflare Workers AI. Check your internet connection.')
  })

  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.success) {
    console.error(`Workers AI request failed (${response.status}):`, JSON.stringify(data?.errors ?? []))
    throw new ModelError(API_ERRORS[response.status] ?? `Workers AI request failed (${response.status}).`)
  }

  // Most models return { response }; some return OpenAI-style { choices }.
  const text = data.result?.response ?? data.result?.choices?.[0]?.message?.content
  if (typeof text !== 'string') throw new ModelError('Workers AI returned an unexpected response.')
  return text.trim()
}

async function givesAwayAnswer(env: Env, model: string, question: string, reply: string) {
  const verdict = await ask(env, model, [{ role: 'user', content: checkPrompt(question, reply) }], 0, 5)
  return verdict.toUpperCase().startsWith('YES')
}

function parseMessages(body: unknown): ChatMessage[] | string {
  const messages = (body as { messages?: unknown })?.messages
  if (!Array.isArray(messages) || messages.length === 0) return 'messages must be a non-empty array'

  for (const m of messages) {
    const { role, content } = (m ?? {}) as { role?: unknown; content?: unknown }
    if (role !== 'user' && role !== 'assistant') return 'each message role must be "user" or "assistant"'
    if (typeof content !== 'string' || !content.trim()) return 'each message needs non-empty content'
    if (content.length > MAX_CONTENT_LENGTH) return `message content can be at most ${MAX_CONTENT_LENGTH} characters`
  }
  if (messages[messages.length - 1].role !== 'user') return 'the last message must be from the user'
  return messages as ChatMessage[]
}

export async function coachReply(env: Env, history: ChatMessage[]) {
  const model = usesOllama(env) ? env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL : env.COACH_MODEL || DEFAULT_MODEL
  const question = history[history.length - 1].content.trim()
  const recent = history.slice(-HISTORY_LIMIT, -1)
  while (recent[0]?.role === 'assistant') recent.shift() // the model expects the history to start with the student
  const toSend: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recent,
    { role: 'user', content: question + REMINDER },
  ]

  let reply = await ask(env, model, toSend)
  if (!(await givesAwayAnswer(env, model, question, reply))) return { reply, rewritten: false, model }

  reply = await ask(env, model, [...toSend, { role: 'assistant', content: reply }, { role: 'user', content: REWRITE_REQUEST }])
  if (!(await givesAwayAnswer(env, model, question, reply))) return { reply, rewritten: true, model }

  return { reply: FALLBACK_REPLY, rewritten: true, model }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
    if (request.method !== 'POST') return json({ error: 'Send a POST request with { messages: [...] }.' }, 405)

    const parsed = parseMessages(await request.json().catch(() => null))
    if (typeof parsed === 'string') return json({ error: parsed }, 400)

    const configError = missingConfig(env)
    if (configError) return json({ error: configError }, 500)

    try {
      return json(await coachReply(env, parsed))
    } catch (error) {
      if (error instanceof ModelError) return json({ error: error.message }, 502)
      console.error('Coach error:', error)
      return json({ error: 'The coach could not respond right now. Please try again.' }, 502)
    }
  },
}