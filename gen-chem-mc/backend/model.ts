// Coach chatbot backend: a Cloudflare Worker that runs Llama 3.1 8B on Workers AI.
//
// The coach never gives answers (facts, definitions, or solutions). It only guides students
// with questions and hints so they work things out themselves. Three layers of protection:
//   1. SYSTEM_PROMPT - the coach's rules, sent with every conversation.
//   2. REMINDER      - a short rule attached to the latest student message before sending.
//   3. Answer check  - a second model call reviews each reply; a leak is rewritten once,
//                      and if the rewrite still leaks, a safe fallback is returned.
//
// Request:  POST { "messages": [{ "role": "user" | "assistant", "content": string }, ...] }
//           The last message must be the student's new message.
// Response: { "reply": string, "rewritten": boolean, "model": string }

// Minimal type for the Workers AI binding, so this file has no extra type dependencies.
interface Ai {
  run(model: string, inputs: Record<string, unknown>): Promise<unknown>
}

export interface Env {
  AI: Ai
  // Optional override, set in wrangler.jsonc "vars" to try another Workers AI model.
  COACH_MODEL?: string
}

type ChatRole = 'system' | 'user' | 'assistant'
type ChatMessage = { role: ChatRole; content: string }

const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8-fast'
const MAX_MESSAGES = 40
const MAX_CONTENT_LENGTH = 4000

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Layer 1: the coach's rules.
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

// Layer 2: attached only to what is sent to the model, never shown to the student.
const REMINDER =
  '\n\n[Coach reminder: do NOT give the answer, a definition, a fact they asked for, ' +
  'any calculated number, or any solution step. Reply with ONE short guiding question ' +
  'or hint that is specific to this question. If the student stated an answer, confirm ' +
  'it only if it is correct.]'

const REWRITE_REQUEST =
  '[Coach reminder: that reply gave away the answer. Rewrite it as ONE guiding question ' +
  'or hint specific to the question, without stating the answer, a definition, or any result.]'

// Layer 3: the reviewer prompt for the answer check.
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

// Workers AI models return either { response } or an OpenAI-style { choices }.
function extractText(result: unknown): string {
  const r = result as {
    response?: unknown
    choices?: { message?: { content?: unknown } }[]
  }
  if (typeof r?.response === 'string') return r.response
  const content = r?.choices?.[0]?.message?.content
  if (typeof content === 'string') return content
  throw new Error('Unexpected model response shape')
}

async function ask(
  env: Env,
  model: string,
  messages: ChatMessage[],
  temperature = 0.3,
  maxTokens = 256,
): Promise<string> {
  const result = await env.AI.run(model, { messages, temperature, max_tokens: maxTokens })
  return extractText(result).trim()
}

async function givesAwayAnswer(env: Env, model: string, question: string, reply: string) {
  const verdict = await ask(env, model, [{ role: 'user', content: checkPrompt(question, reply) }], 0, 5)
  return verdict.toUpperCase().startsWith('YES')
}

function parseMessages(body: unknown): ChatMessage[] | string {
  const messages = (body as { messages?: unknown })?.messages
  if (!Array.isArray(messages) || messages.length === 0) return 'messages must be a non-empty array'
  if (messages.length > MAX_MESSAGES) return `messages can hold at most ${MAX_MESSAGES} entries`

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
  const model = env.COACH_MODEL || DEFAULT_MODEL
  const question = history[history.length - 1].content.trim()

  const toSend: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(0, -1),
    { role: 'user', content: question + REMINDER },
  ]

  let reply = await ask(env, model, toSend)
  if (!(await givesAwayAnswer(env, model, question, reply))) {
    return { reply, rewritten: false, model }
  }

  reply = await ask(env, model, [
    ...toSend,
    { role: 'assistant', content: reply },
    { role: 'user', content: REWRITE_REQUEST },
  ])
  if (!(await givesAwayAnswer(env, model, question, reply))) {
    return { reply, rewritten: true, model }
  }

  return { reply: FALLBACK_REPLY, rewritten: true, model }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }
    if (request.method !== 'POST') {
      return json({ error: 'Send a POST request with { messages: [...] }.' }, 405)
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Request body must be JSON.' }, 400)
    }

    const parsed = parseMessages(body)
    if (typeof parsed === 'string') return json({ error: parsed }, 400)

    try {
      return json(await coachReply(env, parsed))
    } catch (error) {
      console.error('Coach model error:', error)
      return json({ error: 'The coach could not respond right now. Please try again.' }, 502)
    }
  },
}
