import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import type { ImageAttachment } from '../../../shared/images'
import type { SavedMessage } from '../../../shared/conversations'
import { MAX_MESSAGE_CHARACTERS } from '../../../shared/coach'
import { readImageFile } from '../../lib/imageAttachment'
import CoachMessage from '../../components/CoachMessage'
import PageHeader from '../../components/PageHeader'
import { Icon } from '../../components/AppLayout'
import ConversationList from './ConversationList'
import type { ConversationsApi } from './conversationsApi'
import { useConversations } from './useConversations'
import './chat.css'

const suggestions = ['Help me plan for my exam', 'I don’t know how to start this problem', 'Reflect on my last study session', 'Help me understand my study habits']
type History = ReturnType<typeof useConversations>

function SavedImage({ message, api }: { message: SavedMessage; api: ConversationsApi }) {
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const attachmentId = message.attachment?.id
  useEffect(() => {
    if (!attachmentId) return
    const controller = new AbortController()
    let objectUrl: string | undefined
    void api.image(message.conversationId, attachmentId, controller.signal).then(blob => {
      if (controller.signal.aborted) return
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    }).catch(() => { if (!controller.signal.aborted) setFailed(true) })
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [api, message.conversationId, attachmentId, attempt])
  return url ? <img className="chat-image" src={url} alt="Saved problem attachment" onError={() => { setFailed(true); setUrl(null) }} />
    : failed ? <span className="chat-image-unavailable">Image unavailable. <button type="button" className="suggestion-chip" onClick={() => { setFailed(false); setUrl(null); setAttempt(value => value + 1) }}>Retry image</button></span>
      : <span role="status">Loading image…</span>
}

function ChatPanel({ history }: { history: History }) {
  const { chat } = history
  const [input, setInput] = useState('')
  const [image, setImage] = useState<ImageAttachment | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [reading, setReading] = useState(false)
  const [editing, setEditing] = useState(false)
  const inputFile = useRef<HTMLInputElement | null>(null)
  const imageJob = useRef(0)
  const alive = useRef(true)
  const end = useRef<HTMLDivElement | null>(null)
  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
  useEffect(() => { end.current?.scrollIntoView?.({ block: 'nearest' }) }, [chat.messages, chat.pending])
  const failed = chat.messages.at(-1)?.turnStatus === 'failed' ? chat.messages.findLast(message => message.role === 'user') : undefined
  const blocked = chat.pending || chat.loading || !!failed && !editing

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = input.trim() || (image ? 'Help me think through the problem in this image.' : '')
    if (!content) { setImageError('Enter a message or attach an image.'); return }
    if (blocked || reading) return
    if (!history.send(content, image ?? undefined)) return
    setInput('')
    setImage(null)
    setEditing(false)
  }
  const chooseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || blocked) return
    const job = ++imageJob.current
    setReading(true)
    setImageError(null)
    try {
      const attachment = await readImageFile(file)
      if (alive.current && imageJob.current === job) setImage(attachment)
    } catch (error) {
      if (alive.current && imageJob.current === job) setImageError(error instanceof Error ? error.message : 'The image could not be read.')
    } finally {
      if (alive.current && imageJob.current === job) setReading(false)
    }
  }
  const edit = async () => {
    if (!failed) return
    setReading(true)
    setImageError(null)
    try {
      const original = await history.editInput(failed)
      if (!alive.current) return
      setInput(original.content)
      setImage(original.image ?? null)
      setEditing(true)
    } catch {
      if (alive.current) {
        setInput(failed.content)
        setEditing(true)
        setImageError('Attach the original image again if it could not be saved.')
      }
    } finally { if (alive.current) setReading(false) }
  }

  return <section className="coach-card chat-active" aria-label="Coach conversation">
    <div className="card-privacy"><Icon name="lock" /><span>AI study coach · Saved privately to your account.</span></div>
    <h2 className="chat-active-title">{history.conversations.find(conversation => conversation.id === history.selectedId)?.title ?? 'New chat'}</h2>
    {chat.loading && <p role="status">Loading messages…</p>}
    {chat.cursor && <button type="button" className="suggestion-chip" disabled={chat.loading || chat.pending} onClick={history.moreMessages}>Older messages</button>}
    <div className="conversation" role="log" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions text">
      {!chat.messages.length && !chat.loading && <div className="message-row coach"><span className="coach-avatar" aria-hidden="true" /><div className="message">What would you like to work through today?</div></div>}
      {chat.messages.map(message => <div key={message.id} className={'message-row ' + (message.role === 'user' ? 'student' : 'coach')}>
        {message.role === 'assistant' && <span className="coach-avatar" aria-hidden="true" />}
        {message.role === 'assistant' ? <CoachMessage content={message.content} /> : <div className="message">
          {history.localImage(message) ? <img className="chat-image" src={history.localImage(message)!.dataUrl} alt="Attached problem" />
            : message.attachment && <SavedImage message={message} api={history.api} />}
          <span>{message.content}</span>
          {message.turnStatus === 'failed' && <span className="chat-turn-status">{message.turnError?.code === 'DELIVERY_UNCONFIRMED'
            ? 'Save unconfirmed · retry before leaving this page' : 'Response failed · message retained'}</span>}
          {message.turnStatus === 'pending' && <span className="chat-turn-status">Response pending</span>}
        </div>}
      </div>)}
      <div ref={end} />
    </div>
    {chat.pending && <div className="message-row coach coach-pending" role="status" aria-label="Coach is thinking"><span className="coach-avatar" aria-hidden="true" />
      <div className="message thinking-message"><span>Thinking</span><span className="thinking-dots" aria-hidden="true"><i /><i /><i /></span></div>
    </div>}
    {(chat.error || failed) && <div className="coach-error" role="alert"><p>{chat.error ?? failed?.turnError?.message ?? 'This response was interrupted. Retry to continue.'}</p>
      <div className="coach-error-actions">{failed ? <>
        <button type="button" className="suggestion-chip" disabled={chat.pending || reading} onClick={() => { void history.retry(failed) }}>Retry</button>
        <button type="button" className="suggestion-chip" disabled={chat.pending || reading} onClick={() => { void edit() }}>Edit message</button>
      </> : <button type="button" className="suggestion-chip" disabled={chat.loading} onClick={history.refreshMessages}>Reload messages</button>}</div>
    </div>}
    <div className="suggestions" aria-label="Suggested prompts">{suggestions.map(suggestion => <button type="button" className="suggestion-chip" key={suggestion} disabled={blocked} onClick={() => setInput(suggestion)}>{suggestion}</button>)}</div>
    {imageError && <p className="attachment-error" role="alert">{imageError}</p>}
    {reading && <p role="status">Preparing image…</p>}
    <form className="message-form image-message-form" onSubmit={send} aria-busy={chat.pending || reading}>
      {image && <div className="attachment-preview"><img src={image.dataUrl} alt="Attachment preview" /><span>{image.name}</span>
        <button type="button" className="suggestion-chip" disabled={chat.pending} onClick={() => { imageJob.current++; setReading(false); setImage(null); setImageError(null) }}>Remove</button>
      </div>}
      <div className="composer-row">
        <button type="button" className="attach-button" aria-label="Attach image" title="Attach a JPEG or PNG" disabled={blocked || reading} onClick={() => inputFile.current?.click()}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.5" /><path d="m4 17 5-5 4 4 3-3 5 5" /></svg>
        </button>
        <input className="message-input" aria-label="Message to coach" placeholder="Share what you’re thinking..." maxLength={MAX_MESSAGE_CHARACTERS} value={input} disabled={blocked} onChange={event => setInput(event.target.value)} />
        <button type="submit" className="send-button" disabled={blocked || reading || !input.trim() && !image}>{chat.pending ? 'Thinking…' : 'Send'}</button>
      </div>
      <input type="file" ref={inputFile} accept="image/png,image/jpeg" aria-label="Choose a JPEG or PNG image" hidden disabled={blocked || reading} onChange={event => { void chooseImage(event) }} />
    </form>
    <p className="attachment-help">Attach one JPEG or PNG up to 2 MB. Saved images are private and expire with the chat.</p>
  </section>
}

export default function SavedCoach() {
  const history = useConversations()
  return <>
    <PageHeader title="Coach" subtitle="A space to plan, reflect, and think through your approach." />
    <div className="chat-workspace">
      <ConversationList conversations={history.conversations} selectedId={history.selectedId} loading={history.listLoading} error={history.listError}
        hasMore={!!history.listCursor} onSelect={history.select} onNew={history.newChat} onMore={history.moreConversations} onRetry={history.refreshList} />
      <ChatPanel key={history.selectedId ?? 'new-' + history.draftVersion} history={history} />
    </div>
  </>
}
