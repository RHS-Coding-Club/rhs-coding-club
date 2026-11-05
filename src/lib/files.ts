import { z } from 'zod'

/**
 * Widths the /files route will resize an upload to. A short fixed list keeps
 * each image to a handful of stored copies, which is what keeps the Images
 * free tier (5,000 unique transformations a month) out of reach.
 */
export const IMAGE_WIDTHS = [64, 128, 256, 384, 640, 960, 1280, 1920] as const
export type ImageWidth = (typeof IMAGE_WIDTHS)[number]

/**
 * Public URL for an R2 key stored in a table. With a `width`, the route serves
 * a WebP copy no wider than that (never upscaled), so pass about twice the
 * rendered CSS width.
 */
export function fileUrl(key: string | null | undefined, width?: ImageWidth) {
  if (!key) return undefined
  return width ? `/files/${key}?w=${width}` : `/files/${key}`
}

/**
 * A `srcSet` for an upload, so the browser picks the copy that fits the
 * `sizes` it is given and the screen's pixel density.
 */
export function fileSrcSet(
  key: string | null | undefined,
  widths: readonly ImageWidth[] = [384, 640, 960, 1280, 1920],
) {
  if (!key) return undefined
  return widths.map((w) => `/files/${key}?w=${w} ${w}w`).join(', ')
}

/** The R2 key in a plain `/files/<key>` URL (as rich text stores images), or null. */
export function keyFromFileUrl(src: string) {
  return /^\/files\/([a-z]+\/[0-9a-f-]{36}\.[a-z]{3,4})$/.exec(src)?.[1] ?? null
}

/** A user's avatar: an uploaded one wins over the OAuth provider's image. */
export function avatarUrl(
  user: { avatarKey?: string | null; image?: string | null },
  width: ImageWidth = 128,
) {
  return fileUrl(user.avatarKey, width) ?? user.image ?? undefined
}

/**
 * A stored image key for one upload purpose (`avatar/<uuid>.png`). Forms
 * send keys back to the server, so each column only accepts its own kind:
 * nobody can point their avatar at a project screenshot, then have it
 * deleted along with their account.
 */
export function storedImageKey(
  purpose: 'avatar' | 'event' | 'officer' | 'badge' | 'project',
) {
  return z
    .string()
    .regex(
      new RegExp(`^${purpose}/[0-9a-f-]{36}\\.(png|jpg|webp|gif|avif)$`),
      'Unknown image.',
    )
}
