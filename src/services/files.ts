import { IMAGE_WIDTHS } from '#/lib/files'
import type { ImageWidth } from '#/lib/files'

// Uploaded images live in R2 (the FILES binding) and are served by the
// /files/$ route. Tables store the key, never a URL; render with `fileUrl`.
// Resized copies sit beside them under `w<width>/<key>`, made on first request.

export const UPLOAD_PURPOSES = [
  'avatar',
  'project',
  'event',
  'badge',
  'officer',
  'post',
] as const
export type UploadPurpose = (typeof UPLOAD_PURPOSES)[number]

export const IMAGE_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadError'
  }
}

/** Validates an image and stores it under `<purpose>/<uuid>.<ext>`. Returns the key. */
export async function putImage(bucket: R2Bucket, purpose: UploadPurpose, file: File) {
  const ext = IMAGE_TYPES[file.type]
  if (!ext) throw new UploadError('Upload a PNG, JPEG, WebP, GIF, or AVIF image.')
  if (file.size > MAX_UPLOAD_BYTES)
    throw new UploadError('Images must be 5 MB or smaller.')
  if (file.size === 0) throw new UploadError('That file is empty.')
  const key = `${purpose}/${crypto.randomUUID()}.${ext}`
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  })
  return key
}

/** Best-effort delete of an upload and its resized copies; a missing object is not an error. */
export async function deleteFile(bucket: R2Bucket, key: string | null | undefined) {
  if (key) await bucket.delete(withVariants([key]))
}

/** Where the resized copy of `key` at `width` is stored. */
export function variantKey(key: string, width: ImageWidth) {
  return `w${width}/${key}`
}

/** The keys plus every resized copy they may have, for deleting them together. */
export function withVariants(keys: string[]) {
  return keys.flatMap((key) => [key, ...IMAGE_WIDTHS.map((w) => variantKey(key, w))])
}

/** A `?w=` value the route resizes to, or null for anything else. */
export function parseWidth(value: string | null): ImageWidth | null {
  const width = Number(value)
  return (IMAGE_WIDTHS as readonly number[]).includes(width)
    ? (width as ImageWidth)
    : null
}

// GIFs may be animated, and the resize would keep only the first frame.
const RESIZABLE = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/avif'])

/**
 * A copy of `key` no wider than `width`, as WebP, stored the first time it's
 * asked for so each size is only ever transformed once. Returns null when it
 * can't (no such file, a GIF, or the Images call failed, for instance past the
 * free tier's monthly limit); the caller then serves the original.
 */
export async function makeVariant(
  bucket: R2Bucket,
  images: ImagesBinding | undefined,
  key: string,
  width: ImageWidth,
) {
  if (!images) return null
  const original = await bucket.get(key)
  if (!original) return null
  const type = original.httpMetadata?.contentType ?? ''
  if (!RESIZABLE.has(type)) return null
  const bytes = await original.arrayBuffer()
  try {
    const info = await images.info(new Blob([bytes]).stream())
    const target = 'width' in info ? Math.min(width, info.width) : width
    const result = await images
      .input(new Blob([bytes]).stream())
      .transform({ width: target, fit: 'scale-down' })
      .output({ format: 'image/webp', quality: 85 })
    const resized = await result.response().arrayBuffer()
    // An already small, well-compressed upload can come out bigger; keep it then.
    const smaller = resized.byteLength < bytes.byteLength
    const stored = await bucket.put(variantKey(key, width), smaller ? resized : bytes, {
      httpMetadata: {
        contentType: smaller ? result.contentType() : type,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    })
    // The upload may have been deleted while this ran, after `deleteFile` had
    // already cleared the copies; don't leave this one serving a removed image.
    if (!(await bucket.head(key))) {
      await bucket.delete(variantKey(key, width))
      return null
    }
    return stored
  } catch (err) {
    console.warn('[files] could not resize', key, width, err)
    return null
  }
}

/** Keys are `<purpose>/<uuid>.<ext>`; anything else is rejected before touching R2. */
export function isValidKey(key: string) {
  return /^[a-z]+\/[0-9a-f-]{36}\.[a-z]{3,4}$/.test(key)
}
