import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react'
import { MAX_MESSAGE_CHARACTERS, recentConversation, type ChatMessage } from '../../shared/coach'
import type { ImageAttachment } from '../../shared/images'
import { readImageFile } from '../lib/imageAttachment'
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
  const [attachment, setAttachment] = useState<ImageAttachment | null>(null)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const [isReadingImage, setIsReadingImage] = useState(false)
  const imageInput = useRef<HTMLInputElement | null>(null)
  const attachmentJob = useRef(0)
  const readingImage = useRef(false)
  const activeRequest = useRef<AbortController | null>(null)
  const endOfConversation = useRef<HTMLDivElement | null>(null)

  useEffect(() => () => {
    activeRequest.current?.abort()
    activeRequest.current = null
    attachmentJob.current++
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
      const recent = recentConversation(conversation)
      if (recent.some(message => message.image)) {
        const health = await fetch('/api/health', { signal: controller.signal })
        const capabilities = await health.json().catch(() => null) as { capabilities?: { images?: boolean }; error?: { message?: string } } | null
        if (!health.ok) throw new Error(typeof capabilities?.error?.message === 'string'
          ? capabilities.error.message
          : `The image coach could not be reached (HTTP ${health.status}). For local mode, start npm run dev:api. Check COACH_API_URL in .env.local and restart the frontend.`)
        if (!capabilities?.capabilities?.images) throw new Error('Images are not available on this server. Ask your team to update the coach service.')
      }
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: recent }),
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
    const content = input.trim() || (attachment ? 'Help me think through the problem in this image.' : '')
    if (!content || activeRequest.current || failedMessages || readingImage.current) return
    const conversation: ChatMessage[] = [...messages, { role: 'user', content, ...(attachment ? { image: attachment } : {}) }]
    setMessages(conversation)
    setInput('')
    setAttachment(null)
    setAttachmentError(null)
    void generate(conversation)
  }

  const editFailedMessage = () => {
    if (!failedMessages || activeRequest.current) return
    setInput(failedMessages.at(-1)?.content ?? '')
    setAttachment(failedMessages.at(-1)?.image ?? null)
    setMessages(failedMessages.slice(0, -1))
    setFailedMessages(null)
    setError(null)
  }

  const chooseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || activeRequest.current || failedMessages) return
    const job = ++attachmentJob.current
    readingImage.current = true
    setIsReadingImage(true)
    setAttachmentError(null)
    try {
      const image = await readImageFile(file)
      if (attachmentJob.current === job) setAttachment(image)
    } catch (caught) {
      if (attachmentJob.current === job) setAttachmentError(caught instanceof Error ? caught.message : 'The image could not be attached.')
    } finally {
      if (attachmentJob.current === job) {
        readingImage.current = false
        setIsReadingImage(false)
      }
    }
  }

  const removeImage = () => {
    attachmentJob.current++
    readingImage.current = false
    setIsReadingImage(false)
    setAttachment(null)
    setAttachmentError(null)
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
                : <div className="message">
                  {message.image && <img className="chat-image" src={message.image.dataUrl} alt={'Attached image ' + message.image.name} />}
                  {message.content}
                </div>}
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
        {attachmentError && <p className="attachment-error" role="alert">{attachmentError}</p>}
        {isReadingImage && <p className="attachment-help" role="status">Preparing image…</p>}
        <form className="message-form image-message-form" onSubmit={sendMessage} aria-busy={isGenerating || isReadingImage}>
          {attachment && <div className="attachment-preview">
            <img src={attachment.dataUrl} alt="Attachment preview" />
            <span>{attachment.name}</span>
            <button type="button" className="suggestion-chip" aria-label="Remove image" disabled={isGenerating} onClick={removeImage}>Remove</button>
          </div>}
          <div className="composer-row">
            <button type="button" className="attach-button" aria-label="Attach image" title="Attach a JPEG or PNG" disabled={isGenerating || !!failedMessages || isReadingImage} onClick={() => imageInput.current?.click()}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.5" /><path d="m4 17 5-5 4 4 3-3 5 5" /></svg>
            </button>
            <input className="message-input" aria-label="Message to coach" placeholder={attachment ? 'Ask about this image…' : 'Share what you’re thinking...'} maxLength={MAX_MESSAGE_CHARACTERS} value={input} disabled={isGenerating || !!failedMessages} onChange={(event) => setInput(event.target.value)} />
            <button className="send-button" type="submit" disabled={(!input.trim() && !attachment) || isGenerating || !!failedMessages || isReadingImage}>{isGenerating ? 'Thinking…' : 'Send'}</button>
          </div>
          <input ref={imageInput} type="file" accept="image/jpeg,image/png" aria-label="Choose a JPEG or PNG image" hidden disabled={isGenerating || !!failedMessages || isReadingImage} onChange={event => { void chooseImage(event) }} />
        </form>
        <p className="attachment-help">Attach one JPEG or PNG up to 2 MB. Images are sent to the AI coach with your message.</p>
      </section>
    </>
  )
}
