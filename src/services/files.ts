// Uploaded images live in R2 (the FILES binding) and are served by the
// /files/$ route. Tables store the key, never a URL; render with `fileUrl`.

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

/** Best-effort delete; a missing object is not an error. */
export async function deleteFile(bucket: R2Bucket, key: string | null | undefined) {
  if (key) await bucket.delete(key)
}

/** Keys are `<purpose>/<uuid>.<ext>`; anything else is rejected before touching R2. */
export function isValidKey(key: string) {
  return /^[a-z]+\/[0-9a-f-]{36}\.[a-z]{3,4}$/.test(key)
}
