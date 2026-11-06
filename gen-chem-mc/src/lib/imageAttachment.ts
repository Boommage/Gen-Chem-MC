import { inspectImage, MAX_IMAGE_BYTES, type ImageAttachment } from '../../shared/images'

export async function readImageFile(file: File): Promise<ImageAttachment> {
  if (!['image/png', 'image/jpeg'].includes(file.type)) throw new Error('Choose a JPEG or PNG image.')
  if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error('Choose an image smaller than 2 MB. Crop or resize larger photos first.')
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('The image could not be read. Try another file.'))
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('The image could not be read.'))
    reader.readAsDataURL(file)
  })
  const image: ImageAttachment = { name: file.name.slice(0, 120) || 'Attached image', dataUrl }
  if (!inspectImage(image)) throw new Error('This image is invalid or too large in dimensions. Use a JPEG or PNG up to 4096 pixels per side and 12 megapixels.')
  // A browser decode catches corrupt image bodies as well as invalid headers.
  await new Promise<void>((resolve, reject) => {
    const preview = new Image()
    preview.onload = () => resolve()
    preview.onerror = () => reject(new Error('This image could not be opened. Try another JPEG or PNG.'))
    preview.src = dataUrl
  })
  return image
}
