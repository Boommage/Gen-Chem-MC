import { recentConversation, type ChatMessage } from '../../shared/coach.ts'
import type { SendTurnRequest } from '../../shared/conversations.ts'
import type { WorkerEnv } from '../env.ts'
import { CoachInferenceError, generateCoachingReply, generateConversationTitle } from '../model.ts'
import { attachmentMetadata, imageStorage, loadImage, saveImage } from './attachments.ts'
import { ConversationError } from './errors.ts'
import { ConversationRepository } from './repository.ts'
import { inputHash } from './validation.ts'

export async function submitTurn(repo: ConversationRepository, env: WorkerEnv, id: string, input: SendTurnRequest, first = false) {
  if (input.image) imageStorage(env)
  const hash = await inputHash(input)
  const attachment = input.image ? attachmentMetadata(id, input.clientTurnId, hash, input.image) : undefined
  const reservation = await repo.reserve(id, input.clientTurnId, hash, input.content, first, attachment)
  if (reservation.replay) return reservation.replay
  try {
    if (attachment && input.image) await saveImage(env, repo.userId, attachment, input.image)
    const rows = await repo.context(id, input.clientTurnId)
    // Bound context before fetching any saved image bytes. Failed turns are not
    // included by the repository and cannot leave unmatched student messages.
    const placeholders: ChatMessage[] = rows.map(row => ({ role: row.role, content: row.content,
      ...(row.attachment_id ? { image: { name: 'saved', dataUrl: '' } } : {}) }))
    const bounded = recentConversation(placeholders)
    const keptRows = rows.slice(rows.length - bounded.length)
    const messages: ChatMessage[] = []
    for (const row of keptRows) {
      const image = row.attachment_id ? row.turn_id === input.clientTurnId && input.image ? input.image
        : await loadImage(env, repo.userId, await repo.attachment(id, row.attachment_id)) : undefined
      messages.push({ role: row.role, content: row.content, ...(image ? { image } : {}) })
    }
    await repo.expirePending(id)
    const current = await repo.turn(id, input.clientTurnId)
    if (current?.status !== 'pending' || current.attempt_id !== reservation.attemptId) return repo.result(id, input.clientTurnId)
    const { reply } = await generateCoachingReply(messages, env)
    const accepted = await repo.finish(id, input.clientTurnId, reservation.attemptId, reply)
    const result = await repo.result(id, input.clientTurnId)
    if (accepted && result.status === 'completed' && (await repo.conversation(id)).title === 'New chat') {
      const title = await generateConversationTitle(input.content, reply, env)
      if (title) await repo.title(id, title)
    }
    return result
  } catch (error) {
    const safe = error instanceof CoachInferenceError || error instanceof ConversationError ? error
      : new ConversationError('COACH_UNAVAILABLE', 'The response could not be completed. Your message is saved; retry to continue.', 503)
    await repo.fail(id, input.clientTurnId, reservation.attemptId, safe.code, safe.message)
    throw safe
  }
}
