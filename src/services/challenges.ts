import type { Db } from '#/db'

/** Emails members about challenges whose publish time has passed (once each). */
export async function announceChallenges(_db: Db, _now: Date) {
  // TODO(build): implemented by the challenges domain.
  return { sent: 0 }
}
