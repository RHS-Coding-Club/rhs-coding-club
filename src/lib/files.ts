/** Public URL for an R2 key stored in a table. */
export function fileUrl(key: string | null | undefined) {
  return key ? `/files/${key}` : undefined
}

/** A user's avatar: an uploaded one wins over the OAuth provider's image. */
export function avatarUrl(user: { avatarKey?: string | null; image?: string | null }) {
  return fileUrl(user.avatarKey) ?? user.image ?? undefined
}
