import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import CoachMessage from './CoachMessage'

afterEach(cleanup)

describe('Coach reply formatting', () => {
  it('renders inline symbols, subscripts, superscripts, and accessible display fractions', () => {
    const { container } = render(<CoachMessage content={String.raw`Consider $\lambda$, $H_2O$, and $x^2$.

$$
\frac{a}{b}
$$`} />)
    expect(container.querySelectorAll('.katex')).toHaveLength(4)
    expect(container.querySelectorAll('math')).toHaveLength(4)
    expect(container.querySelector('mi')?.textContent).toBe('λ')
    expect(container.querySelector('msub')).toBeTruthy()
    expect(container.querySelector('msup')).toBeTruthy()
    expect(container.querySelector('.katex-display mfrac')).toBeTruthy()
    expect(container.querySelector('.katex-error')).toBeNull()
  })

  it('renders paragraphs, emphasis, lists, and tables', () => {
    const { container } = render(<CoachMessage content={'**Reflect first.**\n\nWhat did you notice?\n\n1. Review your approach.\n2. Choose a next step.\n\n| Habit | Reflection |\n| --- | --- |\n| Practice | What helped? |'} />)
    expect(container.querySelector('strong')?.textContent).toBe('Reflect first.')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByRole('table')).toBeTruthy()
  })

  it('preserves literal notation in code and escaped currency', () => {
    const { container } = render(<CoachMessage content={String.raw`Use \$5 for the example; code: \`$\lambda$\`.

\`\`\`text
$x^2$
\`\`\``.replaceAll('\\`', '`')} />)
    expect(container.querySelectorAll('.katex')).toHaveLength(0)
    expect(container.querySelector('code')?.textContent).toBe(String.raw`$\lambda$`)
    expect(container.querySelector('pre code')?.textContent).toContain('$x^2$')
    expect(container.textContent).toContain('$5')
  })

  it('keeps malformed or incomplete notation readable without crashing', () => {
    const { container } = render(<CoachMessage content={String.raw`$\frac{a}{$

Unclosed $\lambda`} />)
    expect(container.querySelector('.katex-error')).toBeTruthy()
    expect(container.textContent).toContain(String.raw`Unclosed $\lambda`)
  })

  it('disables raw HTML, remote images, unsafe links, and trusted LaTeX commands', () => {
    const { container } = render(<CoachMessage content={String.raw`<script>alert('unsafe')</script>

<img src="https://example.com/raw.png" onerror="alert(1)">

![remote](https://example.com/track.png)

[unsafe](javascript:alert%281%29)

$\includegraphics{https://example.com/latex.png}$

$\href{javascript:alert(1)}{unsafe}$`} />)
    expect(container.querySelector('script, img, iframe')).toBeNull()
    expect(container.querySelector('[onerror]')).toBeNull()
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull()
  })
})
