import type { Db } from '#/db'

/** Marks invite-sent requests as joined once the user is in the org. */
export async function syncGithubInvites(_db: Db, _now: Date) {
  // TODO(build): implemented by the github domain.
  return { sent: 0 }
}
