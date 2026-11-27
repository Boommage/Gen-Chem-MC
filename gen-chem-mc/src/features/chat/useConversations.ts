import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import type { ConversationSummary, SavedMessage, SendTurnRequest, TurnResult } from '../../../shared/conversations'
import type { ImageAttachment } from '../../../shared/images'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../../lib/api'
import { readImageFile } from '../../lib/imageAttachment'
import { createConversationsApi } from './conversationsApi'

interface ChatState {
  messages: SavedMessage[]
  cursor: string | null
  loading: boolean
  pending: boolean
  created: boolean
  error: string | null
}
const emptyChat = (): ChatState => ({ messages: [], cursor: null, loading: false, pending: false, created: false, error: null })
const messageFor = (error: unknown) => error instanceof ApiError ? error.message : 'Saved chat could not be reached. Please retry.'
function mergeTurn(messages: SavedMessage[], turn: TurnResult) {
  const first = messages.findIndex(message => message.turnId === turn.turnId)
  if (first < 0) return [...messages, ...turn.messages]
  return [...messages.slice(0, first), ...turn.messages, ...messages.slice(first).filter(message => message.turnId !== turn.turnId)]
}
function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return }
    const cancel = () => { clearTimeout(timer); reject(signal.reason) }
    const timer = setTimeout(() => { signal.removeEventListener('abort', cancel); resolve() }, ms)
    signal.addEventListener('abort', cancel, { once: true })
  })
}

export function useConversations() {
  const { getAccessToken } = useAuth()
  const tokenGetter = useRef(getAccessToken)
  useEffect(() => { tokenGetter.current = getAccessToken }, [getAccessToken])
  const currentToken = useCallback(() => tokenGetter.current(), [])
  // oxlint-disable-next-line react/refs -- The factory captures the callback; it never reads a token during initialization.
  const [api] = useState(() => createConversationsApi(currentToken))
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [listCursor, setListCursor] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draftVersion, setDraftVersion] = useState(0)
  const [chats, setChats] = useState<Record<string, ChatState>>({})
  const cache = useRef(chats)
  const selected = useRef(selectedId)
  const active = useRef(true)
  const controllers = useRef(new Set<AbortController>())
  const jobs = useRef(new Set<string>())
  const inputs = useRef(new Map<string, SendTurnRequest>())
  const listBusy = useRef(false)

  const update = (id: string, change: (chat: ChatState) => ChatState) => {
    if (!active.current) return
    cache.current = { ...cache.current, [id]: change(cache.current[id] ?? emptyChat()) }
    setChats(cache.current)
  }
  const sessionFailure = (error: unknown) => {
    if (!(error instanceof ApiError) || error.status !== 401) return false
    for (const controller of controllers.current) controller.abort()
    inputs.current.clear()
    cache.current = {}
    setChats({})
    setConversations([])
    selected.current = null
    setSelectedId(null)
    setDraftVersion(value => value + 1)
    setListError('Your session is no longer valid. Sign in again to see saved chats.')
    return true
  }

  const loadList = async (cursor: string | null = null) => {
    if (listBusy.current || !active.current) return
    listBusy.current = true
    setListLoading(true)
    setListError(null)
    const controller = new AbortController()
    controllers.current.add(controller)
    try {
      const page = await api.list(cursor, controller.signal)
      if (!active.current || controller.signal.aborted) return
      setConversations(previous => cursor ? [...previous, ...page.conversations.filter(next => !previous.some(old => old.id === next.id))] : page.conversations)
      setListCursor(page.nextCursor)
    } catch (error) {
      if (active.current && !controller.signal.aborted && !sessionFailure(error)) setListError(messageFor(error))
    } finally {
      controllers.current.delete(controller)
      listBusy.current = false
      if (active.current) setListLoading(false)
    }
  }

  const loadInitialList = useEffectEvent(() => { void loadList() })
  useEffect(() => {
    active.current = true
    const pendingControllers = controllers.current
    const pendingInputs = inputs.current
    queueMicrotask(() => { if (active.current) loadInitialList() })
    return () => {
      active.current = false
      for (const controller of pendingControllers) controller.abort()
      pendingControllers.clear()
      pendingInputs.clear()
      listBusy.current = false
    }
  }, [])

  const loadMessages = async (id: string, older = false) => {
    const current = cache.current[id] ?? emptyChat()
    if (current.loading || jobs.current.has(id)) return
    update(id, chat => ({ ...chat, loading: true, error: null }))
    const controller = new AbortController()
    controllers.current.add(controller)
    try {
      const page = await api.messages(id, older ? current.cursor : null, controller.signal)
      if (controller.signal.aborted || !active.current) return
      update(id, chat => ({ ...chat, created: true, cursor: page.nextCursor,
        messages: older ? [...page.messages.filter(message => !chat.messages.some(old => old.id === message.id)), ...chat.messages] : page.messages }))
      const pending = page.messages.find(message => message.turnStatus === 'pending')
      if (pending) void deliver(id, { clientTurnId: pending.turnId, content: pending.content }, true)
    } catch (error) {
      if (active.current && !controller.signal.aborted && !sessionFailure(error)) update(id, chat => ({ ...chat, error: messageFor(error) }))
    } finally {
      controllers.current.delete(controller)
      update(id, chat => ({ ...chat, loading: false }))
    }
  }

  const deliver = async (id: string, input: SendTurnRequest, recoveryOnly = false) => {
    if (jobs.current.has(id)) return
    jobs.current.add(id)
    update(id, chat => ({ ...chat, pending: true, error: null }))
    const controller = new AbortController()
    controllers.current.add(controller)
    const timeout = setTimeout(() => controller.abort(), 135_000)
    try {
      let result: TurnResult
      try {
        result = recoveryOnly ? await api.recover(id, input.clientTurnId, controller.signal)
          : cache.current[id]?.created ? await api.send(id, input, controller.signal)
          : (await api.create({ id, firstTurn: input }, controller.signal)).turn
      } catch (error) {
        if (controller.signal.aborted || error instanceof ApiError && error.status === 401) throw error
        // A lost response may have committed. Read by the stable ID before
        // enabling an explicit retry; never automatically replay a write.
        try { result = await api.recover(id, input.clientTurnId, controller.signal) } catch { throw error }
      }
      while (result.status === 'pending') {
        if (!active.current || controller.signal.aborted) return
        update(id, chat => ({ ...chat, created: true, messages: mergeTurn(chat.messages, result) }))
        await wait(1500, controller.signal)
        result = await api.recover(id, input.clientTurnId, controller.signal)
      }
      if (controller.signal.aborted || !active.current) return
      update(id, chat => ({ ...chat, created: true, messages: mergeTurn(chat.messages, result), error: result.error?.message ?? null }))
      void loadList()
    } catch (error) {
      if (!active.current || sessionFailure(error)) return
      const message = controller.signal.aborted ? 'The response is still unconfirmed. Retry to check the saved turn.' : messageFor(error)
      update(id, chat => ({ ...chat, error: message, messages: chat.messages.map(saved => saved.turnId === input.clientTurnId
        ? { ...saved, turnStatus: 'failed', turnError: { code: 'DELIVERY_UNCONFIRMED', message } } : saved) }))
    } finally {
      clearTimeout(timeout)
      controllers.current.delete(controller)
      jobs.current.delete(id)
      update(id, chat => ({ ...chat, pending: false }))
    }
  }

  const send = (content: string, image?: ImageAttachment) => {
    const id = selected.current ?? crypto.randomUUID()
    if (jobs.current.has(id) || cache.current[id]?.loading) return
    const input: SendTurnRequest = { clientTurnId: crypto.randomUUID(), content, ...(image ? { image } : {}) }
    inputs.current.set(id + '/' + input.clientTurnId, input)
    selected.current = id
    setSelectedId(id)
    const message: SavedMessage = { id: crypto.randomUUID(), conversationId: id, turnId: input.clientTurnId,
      role: 'user', content, createdAt: new Date().toISOString(), turnStatus: 'pending' }
    update(id, chat => ({ ...chat, messages: [...chat.messages, message] }))
    void deliver(id, input)
  }

  const editInput = async (message: SavedMessage) => {
    const cached = inputs.current.get(message.conversationId + '/' + message.turnId)
    if (cached) return cached
    const image = message.attachment ? await readImageFile(new File([
      await api.image(message.conversationId, message.attachment.id),
    ], 'attachment.' + (message.attachment.mimeType === 'image/png' ? 'png' : 'jpg'), { type: message.attachment.mimeType })) : undefined
    return { clientTurnId: message.turnId, content: message.content, ...(image ? { image } : {}) }
  }

  return {
    api, conversations, listCursor, listLoading, listError, selectedId, draftVersion,
    chat: selectedId ? chats[selectedId] ?? emptyChat() : emptyChat(),
    refreshList: () => { void loadList() }, moreConversations: () => { if (listCursor) void loadList(listCursor) },
    select: (id: string) => { selected.current = id; setSelectedId(id); void loadMessages(id) },
    newChat: () => { selected.current = null; setSelectedId(null); setDraftVersion(value => value + 1) },
    moreMessages: () => { if (selectedId && chats[selectedId]?.cursor) void loadMessages(selectedId, true) },
    refreshMessages: () => { if (selectedId) void loadMessages(selectedId) },
    localImage: (message: SavedMessage) => inputs.current.get(message.conversationId + '/' + message.turnId)?.image,
    retry: async (message: SavedMessage) => {
      try { await deliver(message.conversationId, await editInput(message)) } catch (error) { update(message.conversationId, chat => ({ ...chat, error: messageFor(error) })) }
    },
    editInput, send,
  }
}
