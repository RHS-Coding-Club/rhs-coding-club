import { fieldErrors, serverMessage } from './form-helpers'
import { profileSchema } from '#/lib/schemas/account'
import { saveProfile } from '#/server/account'

export interface ProfileDraft {
  name: string
  bio: string
  gradYear: number | null
  skills: string[]
  githubUsername: string
  avatarKey: string | null
}

export function toDraft(user: {
  name: string
  bio: string | null
  gradYear: number | null
  skills: string[]
  githubUsername: string | null
  avatarKey: string | null
}): ProfileDraft {
  return {
    name: user.name,
    bio: user.bio ?? '',
    gradYear: user.gradYear,
    skills: user.skills,
    githubUsername: user.githubUsername ?? '',
    avatarKey: user.avatarKey,
  }
}

/**
 * Validates `next` with the same Zod schema the server uses, then saves the
 * whole profile. Returns field errors, or the saved (cleaned) profile.
 */
export async function persistProfile(
  next: ProfileDraft,
): Promise<{ errors: Record<string, string> } | { saved: ProfileDraft }> {
  const parsed = profileSchema.safeParse(next)
  if (!parsed.success) return { errors: fieldErrors(parsed.error) }
  try {
    await saveProfile({ data: next })
  } catch (err) {
    return { errors: { _: serverMessage(err) } }
  }
  return {
    saved: {
      ...next,
      githubUsername: parsed.data.githubUsername ?? '',
      skills: parsed.data.skills,
    },
  }
}
