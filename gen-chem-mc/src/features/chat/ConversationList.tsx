import type { ConversationSummary } from '../../../shared/conversations'

interface Props {
  conversations: ConversationSummary[]
  selectedId: string | null
  loading: boolean
  error: string | null
  hasMore: boolean
  onSelect(id: string): void
  onNew(): void
  onMore(): void
  onRetry(): void
}

export default function ConversationList({ conversations, selectedId, loading, error, hasMore, onSelect, onNew, onMore, onRetry }: Props) {
  return <aside className="chat-history" aria-label="Chat history">
    <div className="chat-history-heading"><h2>Your chats</h2><button type="button" className="suggestion-chip" onClick={onNew}>New chat</button></div>
    <p className="chat-retention">Saved chats and images expire 14 days after the last saved message.</p>
    {loading && <p role="status">Loading chats…</p>}
    {error && <div role="alert"><p>{error}</p><button type="button" className="suggestion-chip" disabled={loading} onClick={onRetry}>Retry history</button></div>}
    {!loading && !error && conversations.length === 0 && <p>No saved chats yet. Send your first message to start one.</p>}
    <ul className="chat-history-list">
      {conversations.map(conversation => <li key={conversation.id}><button type="button" aria-current={selectedId === conversation.id ? 'true' : undefined}
        className="chat-history-item" onClick={() => onSelect(conversation.id)}>
        <span>{conversation.title}</span><time dateTime={conversation.updatedAt}>{new Date(conversation.updatedAt).toLocaleDateString()}</time>
      </button></li>)}
    </ul>
    {hasMore && <button type="button" className="suggestion-chip" disabled={loading} onClick={onMore}>More chats</button>}
  </aside>
}
