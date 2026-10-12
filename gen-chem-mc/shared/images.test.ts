// @vitest-environment node
import { expect, it } from 'vitest'
import { inspectImage, MAX_IMAGE_DATA_URL_LENGTH } from './images'
import { JPEG_DATA_URL, PNG_IMAGE } from './imageFixtures'

it('accepts real PNG and JPEG bytes and reports dimensions', () => {
  expect(inspectImage(PNG_IMAGE)).toMatchObject({ width: 1, height: 1, image: PNG_IMAGE })
  expect(inspectImage({ name: 'photo.jpg', dataUrl: JPEG_DATA_URL })).toMatchObject({ width: 8, height: 8 })
})

it.each([
  { name: 'url.png', dataUrl: 'https://example.com/photo.png' },
  { name: 'blob.png', dataUrl: 'blob:http://localhost/image' },
  { name: 'spoof.jpg', dataUrl: PNG_IMAGE.dataUrl.replace('image/png', 'image/jpeg') },
  { name: 'bad.png', dataUrl: 'data:image/png;base64,not image bytes' },
  { name: '', dataUrl: PNG_IMAGE.dataUrl },
  { name: 'x'.repeat(121), dataUrl: PNG_IMAGE.dataUrl },
  { name: 'large.png', dataUrl: 'data:image/png;base64,' + 'A'.repeat(MAX_IMAGE_DATA_URL_LENGTH) },
])('rejects invalid uploads or fetchable URLs', image => {
  expect(inspectImage(image)).toBeNull()
})

it('rejects oversized pixel dimensions even when the compressed body is tiny', () => {
  const bytes = Uint8Array.from(atob(PNG_IMAGE.dataUrl.split(',')[1]), c => c.charCodeAt(0))
  new DataView(bytes.buffer).setUint32(16, 5000)
  const base64 = btoa(String.fromCharCode(...bytes))
  expect(inspectImage({ name: 'huge.png', dataUrl: 'data:image/png;base64,' + base64 })).toBeNull()
})
