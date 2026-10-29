import type { Db } from '#/db'

/** Monday digest: this week's challenge, upcoming events, new posts, top of the leaderboard. */
export async function sendWeeklyDigest(_db: Db, _now: Date) {
  // TODO(build): implemented by the digest domain.
  return { sent: 0 }
}
