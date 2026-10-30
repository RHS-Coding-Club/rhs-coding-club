import { z } from 'zod'

/** Public URL for an R2 key stored in a table. */
export function fileUrl(key: string | null | undefined) {
  return key ? `/files/${key}` : undefined
}

/** A user's avatar: an uploaded one wins over the OAuth provider's image. */
export function avatarUrl(user: { avatarKey?: string | null; image?: string | null }) {
  return fileUrl(user.avatarKey) ?? user.image ?? undefined
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
