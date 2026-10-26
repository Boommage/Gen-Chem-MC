import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Coach from './Coach'
import { readImageFile } from '../lib/imageAttachment'
import { PNG_IMAGE } from '../../shared/imageFixtures'

vi.mock('../lib/imageAttachment', () => ({ readImageFile: vi.fn() }))
beforeEach(() => vi.mocked(readImageFile).mockResolvedValue(PNG_IMAGE))
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.mocked(readImageFile).mockReset() })

async function attach() {
  const file = new File(['fixture'], 'worksheet.png', { type: 'image/png' })
  fireEvent.change(screen.getByLabelText('Choose a JPEG or PNG image'), { target: { files: [file] } })
  await screen.findByAltText('Attachment preview')
}

function healthyFetch() {
  return vi.fn((url: string) => Promise.resolve(url === '/api/health'
    ? Response.json({ capabilities: { images: true } })
    : Response.json({ reply: 'Which quantities are given?' })))
}

describe('Coach image attachments', () => {
  it('formats the image coach reply while preserving the uploaded student image', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve(url === '/api/health'
      ? Response.json({ capabilities: { images: true } })
      : Response.json({ reply: String.raw`Check **units** for $\lambda$ and $H_2O$.` }))))
    const { container } = render(<Coach />)
    await attach()
    fireEvent.click(screen.getByRole('button', { name: 'Send', exact: true }))
    await waitFor(() => expect(container.querySelectorAll('.coach .katex')).toHaveLength(2))
    expect(container.querySelector('.coach strong')?.textContent).toBe('units')
    expect(screen.getByAltText('Attached image worksheet.png')).toBeTruthy()
  })

  it('explains how to start the backend when the image health check cannot be reached', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 502 }))
    vi.stubGlobal('fetch', fetchMock)
    render(<Coach />)
    await attach()
    fireEvent.click(screen.getByRole('button', { name: 'Send', exact: true }))
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('HTTP 502')
    expect(alert.textContent).toContain('npm run dev:api')
    expect(alert.textContent).toContain('COACH_API_URL')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getByAltText('Attached image worksheet.png')).toBeTruthy()
  })

  it('previews and removes an attachment before sending', async () => {
    render(<Coach />)
    await attach()
    expect(screen.getByText('worksheet.png')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Remove image' }))
    expect(screen.queryByAltText('Attachment preview')).toBeNull()
    expect((screen.getByRole('button', { name: 'Send', exact: true }) as HTMLButtonElement).disabled).toBe(true)
  })
  it('sends image-only input with a default question and displays the submitted attachment', async () => {
    const fetchMock = healthyFetch()
    vi.stubGlobal('fetch', fetchMock)
    render(<Coach />)
    await attach()
    fireEvent.click(screen.getByRole('button', { name: 'Send', exact: true }))
    await screen.findByText('Which quantities are given?')
    const post = fetchMock.mock.calls.find(call => call[0] === '/api/coach')
    expect(post).toBeTruthy()
    const options = (post as unknown as [string, RequestInit])[1]
    expect(JSON.parse(options.body as string).messages).toEqual([{ role: 'user', content: 'Help me think through the problem in this image.', image: PNG_IMAGE }])
    expect(screen.getByAltText('Attached image worksheet.png')).toBeTruthy()
    expect(screen.queryByAltText('Attachment preview')).toBeNull()
  })
  it('checks backend capability before attempting an image request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ status: 'ok' }))
    vi.stubGlobal('fetch', fetchMock)
    render(<Coach />)
    await attach()
    fireEvent.click(screen.getByRole('button', { name: 'Send', exact: true }))
    expect((await screen.findByRole('alert')).textContent).toContain('Images are not available')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/health')
    expect(screen.queryByRole('status')).toBeNull()
  })
  it('retains the exact attachment during retry without duplicating it', async () => {
    let posts = 0
    const bodies: string[] = []
    vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
      if (url === '/api/health') return Promise.resolve(Response.json({ capabilities: { images: true } }))
      posts++
      bodies.push(options?.body as string)
      return Promise.resolve(posts === 1 ? Response.json({ error: { message: 'Busy' } }, { status: 429 }) : Response.json({ reply: 'What have you tried?' }))
    }))
    render(<Coach />)
    await attach()
    fireEvent.click(screen.getByRole('button', { name: 'Send', exact: true }))
    await screen.findByRole('alert')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await screen.findByText('What have you tried?')
    expect(bodies[0]).toBe(bodies[1])
    expect(screen.getAllByAltText('Attached image worksheet.png')).toHaveLength(1)
  })
  it('restores the image and caption when a failed turn is edited', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'ok' })))
    render(<Coach />)
    await attach()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'My caption' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send', exact: true }))
    await screen.findByRole('alert')
    fireEvent.click(screen.getByRole('button', { name: 'Edit message' }))
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('My caption')
    expect(screen.getByAltText('Attachment preview')).toBeTruthy()
    expect(screen.queryByAltText('Attached image worksheet.png')).toBeNull()
  })
  it('keeps the earlier image in a follow-up request', async () => {
    const bodies: string[] = []
    vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
      if (url === '/api/health') return Promise.resolve(Response.json({ capabilities: { images: true } }))
      bodies.push(options?.body as string)
      return Promise.resolve(Response.json({ reply: bodies.length === 1 ? 'First reply' : 'Follow-up reply' }))
    }))
    render(<Coach />)
    await attach()
    fireEvent.click(screen.getByRole('button', { name: 'Send', exact: true }))
    await screen.findByText('First reply')
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'I see a volume' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send', exact: true }))
    await screen.findByText('Follow-up reply')
    expect(JSON.parse(bodies[1]).messages[0].image).toEqual(PNG_IMAGE)
  })
  it('blocks sending while an image is being prepared', async () => {
    vi.mocked(readImageFile).mockReturnValueOnce(new Promise(() => {}))
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<Coach />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Question' } })
    fireEvent.change(screen.getByLabelText('Choose a JPEG or PNG image'), { target: { files: [new File(['x'], 'image.png', { type: 'image/png' })] } })
    fireEvent.submit(screen.getByRole('textbox').closest('form')!)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByText('Preparing image…')).toBeTruthy()
  })
  it('reports invalid attachments without sending them', async () => {
    vi.mocked(readImageFile).mockRejectedValueOnce(new Error('Choose a JPEG or PNG image.'))
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<Coach />)
    fireEvent.change(screen.getByLabelText('Choose a JPEG or PNG image'), { target: { files: [new File(['pdf'], 'notes.pdf', { type: 'application/pdf' })] } })
    expect((await screen.findByRole('alert')).textContent).toContain('JPEG or PNG')
    await waitFor(() => expect(screen.queryByText('Preparing image…')).toBeNull())
    expect(screen.queryByAltText('Attachment preview')).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
