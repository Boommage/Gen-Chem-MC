import { type FormEvent, useState } from 'react'
import { Icon } from '../components/AppLayout'
import PageHeader from '../components/PageHeader'

const suggestions = [
  'Help me plan for my exam',
  'I don’t know how to start this problem',
  'Reflect on my last study session',
  'Help me understand my study habits',
]

// The Worker started by `npx wrangler dev`. Override with VITE_COACH_URL in .env.local.
const COACH_URL = import.meta.env.VITE_COACH_URL ?? 'http://localhost:8787'

type ChatMessage = { role: 'user' | 'assistant'; content: string }
type CoachResponse = { reply?: string; error?: string }

export default function Coach() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isWaiting, setIsWaiting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = input.trim()
    if (!message || isWaiting) return

    const updatedMessages: ChatMessage[] = [...messages, { role: 'user', content: message }]
    setMessages(updatedMessages)
    setInput('')
    setError(null)
    setIsWaiting(true)

    try {
      const response = await fetch(COACH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })
      const data = (await response.json().catch(() => ({}))) as CoachResponse
      if (!data.reply) throw new Error(data.error ?? 'The coach could not respond. Please try again.')
      const reply = data.reply
      setMessages((current) => [...current, { role: 'assistant', content: reply }])
    } catch (err) {
      // fetch throws a TypeError when the backend can't be reached.
      setError(err instanceof TypeError ? 'The coach could not respond. Check that the backend is running.' : (err as Error).message)
      // Put the unanswered message back in the input so the student can retry.
      setMessages(messages)
      setInput(message)
    } finally {
      setIsWaiting(false)
    }
  }

  return (
    <>
      <PageHeader title="Coach" subtitle="A private space to plan, reflect, and think through your approach." />
      <section className="coach-card" aria-label="Coach conversation">
        <div className="card-privacy"><Icon name="lock" /><span>Private to you unless you choose to share.</span></div>
        <div className="conversation" aria-live="polite">
          <div className="message-row student"><div className="message">I don’t know where to start with this chemistry problem.</div></div>
          <div className="message-row coach"><span className="coach-avatar" aria-hidden="true" /><div className="message">Let’s work through your thinking. What information does the problem give you?</div></div>
          {messages.map((message, index) => (
            <div className={`message-row ${message.role === 'user' ? 'student' : 'coach'}`} key={index}>
              {message.role === 'assistant' && <span className="coach-avatar" aria-hidden="true" />}
              <div className="message">{message.content}</div>
            </div>
          ))}
          {isWaiting && (
            <div className="message-row coach"><span className="coach-avatar" aria-hidden="true" /><div className="message">Thinking…</div></div>
          )}
          {error && (
            <div className="message-row coach" role="alert"><span className="coach-avatar" aria-hidden="true" /><div className="message">{error}</div></div>
          )}
        </div>
        <div className="suggestions" aria-label="Suggested prompts">
          {suggestions.map((suggestion) => <button className="suggestion-chip" type="button" key={suggestion} onClick={() => setInput(suggestion)}>{suggestion}</button>)}
        </div>
        <form className="message-form" onSubmit={sendMessage}>
          <input className="message-input" aria-label="Message to coach" placeholder="Share what you’re thinking..." value={input} onChange={(event) => setInput(event.target.value)} />
          <button className="send-button" type="submit" disabled={!input.trim() || isWaiting}>{isWaiting ? 'Sending…' : 'Send'}</button>
        </form>
      </section>
    </>
  )
}