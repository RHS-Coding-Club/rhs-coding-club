import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import { hasRole } from '#/lib/roles'
import type { Role } from '#/lib/roles'
import { AuthError, requireUser } from '#/server/auth'
import { UPLOAD_PURPOSES, UploadError, putImage } from '#/services/files'
import type { UploadPurpose } from '#/services/files'

/** Anyone signed in sets an avatar, members add project shots, officers the rest. */
const MIN_ROLE: Record<UploadPurpose, Role> = {
  avatar: 'guest',
  project: 'member',
  event: 'officer',
  badge: 'officer',
  officer: 'officer',
  post: 'officer',
}

/**
 * Uploads one image. Send a FormData with `file` and `purpose`; returns the R2
 * key to store on the row. Use the `ImageUpload` component on the client.
 */
export const uploadImage = createServerFn({ method: 'POST' })
  .middleware([requireUser])
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new UploadError('Expected form data.')
    const file = data.get('file')
    const purpose = data.get('purpose')
    if (!(file instanceof File)) throw new UploadError('Choose an image to upload.')
    if (
      typeof purpose !== 'string' ||
      !UPLOAD_PURPOSES.includes(purpose as UploadPurpose)
    )
      throw new UploadError('Unknown upload type.')
    return { file, purpose: purpose as UploadPurpose }
  })
  .handler(async ({ data, context }) => {
    if (!hasRole(context.user.role, MIN_ROLE[data.purpose]))
      throw new AuthError('FORBIDDEN')
    const key = await putImage(env.FILES, data.purpose, data.file)
    return { key }
  })
