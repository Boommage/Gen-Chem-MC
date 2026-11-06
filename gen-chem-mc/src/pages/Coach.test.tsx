import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Coach from './Coach'

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers() })
function send(text = 'Help me study') {
  fireEvent.change(screen.getByRole('textbox', { name: 'Message to coach' }), { target: { value: text } })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
}

describe('Coach requests', () => {
  it('formats assistant replies while keeping student input and sent history literal', async () => {
    const reply = String.raw`Think about **units** and $\lambda$.`
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ reply }))
    vi.stubGlobal('fetch', fetchMock)
    const { container } = render(<Coach />)
    send(String.raw`What does **this** mean: $\lambda$?`)
    await waitFor(() => expect(container.querySelector('.coach .katex')).toBeTruthy())
    expect(container.querySelector('.coach strong')?.textContent).toBe('units')
    expect(container.querySelector('.student .message')?.textContent).toBe(String.raw`What does **this** mean: $\lambda$?`)
    expect(container.querySelector('.student .katex, .student strong')).toBeNull()
    send('What should I check?')
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).messages[1]).toEqual({ role: 'assistant', content: reply })
  })

  it('shows thinking, prevents duplicates, and displays a reply', async () => {
    let resolve!: (value: Response) => void
    const fetchMock = vi.fn().mockReturnValue(new Promise<Response>((done) => { resolve = done }))
    vi.stubGlobal('fetch', fetchMock)
    render(<Coach />)
    send()
    expect(screen.getByRole('status', { name: 'Coach is thinking' })).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Thinking…' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.submit(screen.getByRole('textbox', { name: 'Message to coach' }).closest('form')!)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await act(async () => resolve(Response.json({ reply: 'What have you tried?' })))
    expect(screen.getByText('What have you tried?')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
    expect(fetchMock.mock.calls[0][0]).toBe('/api/coach')
  })
  it('sends follow-up conversation history', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ reply: 'What have you tried?' }))
    vi.stubGlobal('fetch', fetchMock)
    render(<Coach />)
    send('I am stuck')
    await screen.findByText('What have you tried?')
    fetchMock.mockResolvedValueOnce(Response.json({ reply: 'What did that show you?' }))
    send('I checked the units')
    await screen.findByText('What did that show you?')
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).messages).toEqual([
      { role: 'user', content: 'I am stuck' },
      { role: 'assistant', content: 'What have you tried?' },
      { role: 'user', content: 'I checked the units' },
    ])
  })
  it('retries a failed turn without duplicating the student message', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ error: { message: 'Free allowance reached.' } }, { status: 429 })).mockResolvedValueOnce(Response.json({ reply: 'What is your goal?' }))
    vi.stubGlobal('fetch', fetchMock)
    render(<Coach />)
    send()
    await screen.findByRole('alert')
    expect(screen.queryByRole('status')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await screen.findByText('What is your goal?')
    expect(screen.getAllByText('Help me study')).toHaveLength(1)
    expect(fetchMock.mock.calls[0][1].body).toBe(fetchMock.mock.calls[1][1].body)
    expect(screen.queryByRole('alert')).toBeNull()
  })
  it('lets the student edit a failed message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable.')))
    render(<Coach />)
    send('My original question')
    await screen.findByRole('alert')
    fireEvent.click(screen.getByRole('button', { name: 'Edit message' }))
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('My original question')
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.queryByText('My original question')).toBeNull()
  })
  it('does not accept an empty response as a successful turn', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ reply: '' })))
    render(<Coach />)
    send()
    expect((await screen.findByRole('alert')).textContent).toContain('empty response')
  })
  it.each(['', '<html>proxy failure</html>'])('shows a setup error for a non-JSON failure instead of a JSON parser exception', async (body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status: 502 })))
    render(<Coach />)
    send()
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('COACH_API_URL')
    expect(alert.textContent).not.toContain('JSON input')
    expect(screen.queryByRole('status')).toBeNull()
  })
  it.each(['', 'null'])('treats malformed successful replies as recoverable failures', async (body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body)))
    render(<Coach />)
    send()
    expect((await screen.findByRole('alert')).textContent).toContain('unreadable response')
  })
  it('labels mock replies distinctly from live Gemma output', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ reply: 'Mock question?', preview: true })))
    render(<Coach />)
    send()
    expect((await screen.findByRole('note')).textContent).toContain('not live Gemma')
  })
  it('aborts a request when the student leaves the page', async () => {
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    const { unmount } = render(<Coach />)
    send()
    unmount()
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true)
  })
  it('clears thinking and offers retry after the browser timeout', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    })))
    render(<Coach />)
    send()
    await act(async () => { await vi.advanceTimersByTimeAsync(45000) })
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByRole('alert').textContent).toContain('taking too long')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
  })
  it('does not send whitespace-only input', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<Coach />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  ' } })
    fireEvent.submit(screen.getByRole('textbox').closest('form')!)
    await waitFor(() => expect(fetchMock).not.toHaveBeenCalled())
  })
})
