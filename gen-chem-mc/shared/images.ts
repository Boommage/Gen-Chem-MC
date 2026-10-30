export type ImageAttachment = { name: string; dataUrl: string }
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024
export const MAX_HISTORY_IMAGES = 2
export const MAX_IMAGE_DIMENSION = 4096
export const MAX_IMAGE_PIXELS = 12_000_000
export const MAX_IMAGE_DATA_URL_LENGTH = Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 32

export function imageByteSize(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Math.floor(base64.length * 3 / 4) - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0)
}

function dimensions(bytes: Uint8Array, mime: string): { width: number; height: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (mime === 'image/png') {
    const signature = [137, 80, 78, 71, 13, 10, 26, 10]
    if (bytes.length < 45 || !signature.every((value, i) => bytes[i] === value)) return null
    if (view.getUint32(8) !== 13 || String.fromCharCode(...bytes.slice(12, 16)) !== 'IHDR') return null
    if (String.fromCharCode(...bytes.slice(-8, -4)) !== 'IEND') return null
    return { width: view.getUint32(16), height: view.getUint32(20) }
  }
  if (bytes.length < 12 || bytes[0] !== 255 || bytes[1] !== 216 || bytes.at(-2) !== 255 || bytes.at(-1) !== 217) return null
  let offset = 2
  while (offset + 3 < bytes.length) {
    if (bytes[offset++] !== 255) return null
    while (bytes[offset] === 255) offset++
    const marker = bytes[offset++]
    if (marker === 217 || marker === 218 || marker === undefined) break
    if (marker === 1 || (marker >= 208 && marker <= 215)) continue
    if (offset + 2 > bytes.length) return null
    const length = view.getUint16(offset)
    if (length < 2 || offset + length > bytes.length) return null
    if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker)) {
      if (length < 8) return null
      return { height: view.getUint16(offset + 3), width: view.getUint16(offset + 5) }
    }
    offset += length
  }
  return null
}

// Accept uploaded bytes only. Never fetch a user-supplied image URL.
export function inspectImage(image: unknown): { image: ImageAttachment; bytes: number; width: number; height: number } | null {
  if (!image || typeof image !== 'object' || !('name' in image) || !('dataUrl' in image)) return null
  if (typeof image.name !== 'string' || !image.name.trim() || image.name.length > 120) return null
  if (typeof image.dataUrl !== 'string' || image.dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) return null
  const match = /^data:(image\/png|image\/jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(image.dataUrl)
  if (!match || match[2].length % 4 !== 0) return null
  const byteCount = imageByteSize(image.dataUrl)
  if (byteCount < 12 || byteCount > MAX_IMAGE_BYTES) return null
  try {
    const binary = atob(match[2])
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0))
    const size = dimensions(bytes, match[1])
    if (!size || size.width < 1 || size.height < 1 || size.width > MAX_IMAGE_DIMENSION || size.height > MAX_IMAGE_DIMENSION || size.width * size.height > MAX_IMAGE_PIXELS) return null
    return { image: { name: image.name.trim(), dataUrl: image.dataUrl }, bytes: byteCount, ...size }
  } catch {
    return null
  }
}
