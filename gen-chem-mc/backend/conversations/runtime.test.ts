// @vitest-environment node
import { it, expect } from 'vitest'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { startChatRuntime } from '../../tests/chat/runtime.ts'
import { PNG_IMAGE } from '../../shared/imageFixtures.ts'

async function removeTestDirectory(directory: string, parent: string) {
  if (dirname(resolve(directory)) !== parent) throw new Error('Unexpected local test directory')
  await rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
}

it('persists text and images across a real local Worker restart, isolates accounts, retries and cleans up', async () => {
  const parent = resolve('.wrangler/chat-runtime-tests')
  await mkdir(parent, { recursive: true })
  const directory = await mkdtemp(join(parent, 'run-'))
  let runtime: Awaited<ReturnType<typeof startChatRuntime>> | undefined
  try {
    runtime = await startChatRuntime(directory)
    const id = crypto.randomUUID()
    const turnId = crypto.randomUUID()
    const input = { id, firstTurn: { clientTurnId: turnId, content: 'Local image study', image: PNG_IMAGE } }
    const request = async (path: string, method = 'GET', body?: unknown, account = 'a') => runtime!.mf.dispatchFetch(
      new URL(path, runtime!.origin).href, { method, headers: { Authorization: 'Bearer local-test-' + account, 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
    const created = await request('/api/conversations', 'POST', input)
    expect(created.status).toBe(200)
    const data = await created.json() as { turn: { messages: { attachment?: { id: string } }[] } }
    const attachmentId = data.turn.messages[0].attachment!.id
    const usageBefore = await runtime.db.prepare('SELECT class_a FROM r2_usage').first()
    expect((await request('/api/conversations', 'POST', input)).status).toBe(200)
    expect(await runtime.db.prepare('SELECT class_a FROM r2_usage').first()).toEqual(usageBefore)
    await runtime.close()

    runtime = await startChatRuntime(directory)
    const resumed = await request(`/api/conversations/${id}/messages`)
    expect(resumed.status).toBe(200)
    const page = await resumed.json() as { messages: unknown[] }
    expect(page.messages).toHaveLength(2)
    const image = await request(`/api/conversations/${id}/attachments/${attachmentId}`)
    expect(image.status).toBe(200)
    expect(image.headers.get('Content-Type')).toBe('image/png')
    expect(new Uint8Array(await image.arrayBuffer())).toEqual(Uint8Array.from(atob(PNG_IMAGE.dataUrl.split(',')[1]), char => char.charCodeAt(0)))
    expect((await request(`/api/conversations/${id}/attachments/${attachmentId}`, 'GET', undefined, 'b')).status).toBe(404)
    expect(await (await request('/api/conversations', 'GET', undefined, 'b')).json()).toEqual({ conversations: [], nextCursor: null })

    const retryInput = { clientTurnId: crypto.randomUUID(), content: '[test failure] follow up after restart' }
    expect((await request(`/api/conversations/${id}/turns`, 'POST', retryInput)).status).toBe(503)
    expect(await (await request(`/api/conversations/${id}/turns/${retryInput.clientTurnId}`)).json()).toMatchObject({ status: 'failed' })
    expect((await request(`/api/conversations/${id}/turns`, 'POST', retryInput)).status).toBe(200)
    expect((await (await request(`/api/conversations/${id}/messages`)).json() as { messages: unknown[] }).messages).toHaveLength(4)

    await runtime.db.prepare("UPDATE conversations SET expires_at = '2000-01-01T00:00:00.000Z' WHERE id = ?").bind(id).run()
    expect((await request(`/api/conversations/${id}/messages`)).status).toBe(404)
    expect((await request('/__test__/cleanup', 'POST')).status).toBe(200)
    expect((await runtime.bucket.list()).objects).toHaveLength(0)
    expect((await runtime.db.prepare('SELECT COUNT(*) AS count FROM image_deletions').first())?.count).toBe(0)
  } finally {
    await runtime?.close()
    // Only remove this test's freshly allocated child of the known workspace directory.
    await removeTestDirectory(directory, parent)
  }
}, 30_000)
