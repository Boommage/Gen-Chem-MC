import { type FormEvent, useEffect, useRef, useState } from 'react'
import { MAX_MESSAGE_CHARACTERS, recentConversation, type ChatMessage } from '../../shared/coach'
import { Icon } from '../components/AppLayout'
import CoachMessage from '../components/CoachMessage'
import PageHeader from '../components/PageHeader'

const suggestions = [
  'Help me plan for my exam',
  'I don’t know how to start this problem',
  'Reflect on my last study session',
  'Help me understand my study habits',
]

export default function Coach() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [failedMessages, setFailedMessages] = useState<ChatMessage[] | null>(null)
  const [preview, setPreview] = useState(false)
  const activeRequest = useRef<AbortController | null>(null)
  const endOfConversation = useRef<HTMLDivElement | null>(null)

  useEffect(() => () => {
    activeRequest.current?.abort()
    activeRequest.current = null
  }, [])

  useEffect(() => {
    endOfConversation.current?.scrollIntoView?.({ block: 'nearest' })
  }, [messages, isGenerating, error])

  const generate = async (conversation: ChatMessage[]) => {
    if (activeRequest.current) return
    const controller = new AbortController()
    activeRequest.current = controller
    setIsGenerating(true)
    setError(null)
    const timeout = setTimeout(() => controller.abort(), 45_000)
    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: recentConversation(conversation) }),
        signal: controller.signal,
      })
      const responseText = await response.text()
      let decoded: unknown
      try {
        decoded = JSON.parse(responseText)
      } catch {
        throw new Error(response.ok
          ? 'The coach returned an unreadable response. Please retry.'
          : `The coach backend could not be reached (HTTP ${response.status}). Check COACH_API_URL in .env.local and restart the frontend.`)
      }
      if (!decoded || typeof decoded !== 'object') throw new Error('The coach returned an unreadable response. Please retry.')
      const data = decoded as { reply?: unknown; preview?: boolean; error?: { message?: unknown } }
      if (!response.ok) {
        const message = typeof data.error?.message === 'string' ? data.error.message : 'The coach could not respond. Check your connection and try again.'
        throw new Error(message)
      }
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('The coach returned an empty response. Please retry.')
      if (activeRequest.current !== controller) return
      setMessages([...conversation, { role: 'assistant', content: data.reply }])
      setFailedMessages(null)
      setPreview(data.preview === true)
    } catch (caught) {
      if (activeRequest.current !== controller) return
      const message = controller.signal.aborted ? 'The coach is taking too long. Please retry.' : caught instanceof Error ? caught.message : 'The coach could not respond. Please retry.'
      setError(message)
      setFailedMessages(conversation)
    } finally {
      clearTimeout(timeout)
      if (activeRequest.current === controller) {
        activeRequest.current = null
        setIsGenerating(false)
      }
    }
  }

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = input.trim()
    if (!content || activeRequest.current || failedMessages) return
    const conversation: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(conversation)
    setInput('')
    void generate(conversation)
  }

  const editFailedMessage = () => {
    if (!failedMessages || activeRequest.current) return
    setInput(failedMessages.at(-1)?.content ?? '')
    setMessages(failedMessages.slice(0, -1))
    setFailedMessages(null)
    setError(null)
  }

  return (
    <>
      <PageHeader title="Coach" subtitle="A private space to plan, reflect, and think through your approach." />
      <section className="coach-card" aria-label="Coach conversation">
        <div className="card-privacy"><Icon name="lock" /><span>AI study coach · Chat history resets when you leave this page.</span></div>
        {preview && <p className="coach-preview" role="note">Mock preview: these are canned responses, not live Gemma output.</p>}
        <div className="conversation" role="log" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions text">
          {messages.length === 0 && <div className="message-row coach"><span className="coach-avatar" aria-hidden="true" /><div className="message">What would you like to work through today?</div></div>}
          {messages.map((message, index) => (
            <div className={'message-row ' + (message.role === 'user' ? 'student' : 'coach')} key={index}>
              {message.role === 'assistant' && <span className="coach-avatar" aria-hidden="true" />}
              {message.role === 'assistant'
                ? <CoachMessage content={message.content} />
                : <div className="message">{message.content}</div>}
            </div>
          ))}
          <div ref={endOfConversation} />
        </div>
        {isGenerating && <div className="message-row coach coach-pending" role="status" aria-label="Coach is thinking">
          <span className="coach-avatar" aria-hidden="true" />
          <div className="message thinking-message"><span>Thinking</span><span className="thinking-dots" aria-hidden="true"><i /><i /><i /></span></div>
        </div>}
        {error && <div className="coach-error" role="alert">
          <p>{error}</p>
          <div className="coach-error-actions">
            <button type="button" className="suggestion-chip" disabled={isGenerating} onClick={() => { if (failedMessages) void generate(failedMessages) }}>Retry</button>
            <button type="button" className="suggestion-chip" disabled={isGenerating} onClick={editFailedMessage}>Edit message</button>
          </div>
        </div>}
        <div className="suggestions" aria-label="Suggested prompts">
          {suggestions.map((suggestion) => <button className="suggestion-chip" type="button" key={suggestion} disabled={isGenerating || !!failedMessages} onClick={() => setInput(suggestion)}>{suggestion}</button>)}
        </div>
        <form className="message-form" onSubmit={sendMessage} aria-busy={isGenerating}>
          <input className="message-input" aria-label="Message to coach" placeholder="Share what you’re thinking..." maxLength={MAX_MESSAGE_CHARACTERS} value={input} disabled={isGenerating || !!failedMessages} onChange={(event) => setInput(event.target.value)} />
          <button className="send-button" type="submit" disabled={!input.trim() || isGenerating || !!failedMessages}>{isGenerating ? 'Thinking…' : 'Send'}</button>
        </form>
      </section>
    </>
  )
}
