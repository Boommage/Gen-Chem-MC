import { afterEach, expect, it, vi } from 'vitest'
import { readImageFile } from './imageAttachment'
import { PNG_IMAGE } from '../../shared/imageFixtures'
import { MAX_IMAGE_BYTES } from '../../shared/images'

afterEach(() => vi.unstubAllGlobals())
function file() {
  const bytes = Uint8Array.from(atob(PNG_IMAGE.dataUrl.split(',')[1]), c => c.charCodeAt(0))
  return new File([bytes], 'worksheet.png', { type: 'image/png' })
}
it('reads a file and verifies a browser decode before accepting it', async () => {
  vi.stubGlobal('Image', class {
    onload: (() => void) | null = null
    set src(_value: string) { queueMicrotask(() => this.onload?.()) }
  })
  expect(await readImageFile(file())).toEqual(PNG_IMAGE)
})
it('rejects unreadable pixels even with an apparently valid header', async () => {
  vi.stubGlobal('Image', class {
    onerror: (() => void) | null = null
    set src(_value: string) { queueMicrotask(() => this.onerror?.()) }
  })
  await expect(readImageFile(file())).rejects.toThrow('could not be opened')
})
it('rejects unsupported file types before reading them', async () => {
  await expect(readImageFile(new File(['<svg />'], 'diagram.svg', { type: 'image/svg+xml' }))).rejects.toThrow('JPEG or PNG')
})
it('rejects oversized files before decoding them', async () => {
  await expect(readImageFile(new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'big.png', { type: 'image/png' }))).rejects.toThrow('2 MB')
})
