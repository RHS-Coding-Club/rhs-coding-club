import { getDb } from '#/db'
import { announceChallenges } from './challenges'
import { sendEventReminders } from './events'
import { syncGithubInvites } from './github'
import { sendWeeklyDigest } from './digest'

// Keep these in sync with `triggers.crons` in wrangler.jsonc.
export const HOURLY = '0 * * * *'
/** Mondays 16:00 UTC (9 AM in the club's timezone during daylight time). */
export const WEEKLY = '0 16 * * 1'

/**
 * Runs the jobs for one cron tick. Each job is independent and idempotent
 * (it records what it already sent), so a failed or repeated tick is safe.
 */
export async function runScheduled(cron: string, now = new Date()) {
  const db = getDb()
  const jobs: Record<string, () => Promise<unknown>> =
    cron === WEEKLY
      ? { weeklyDigest: () => sendWeeklyDigest(db, now) }
      : {
          announceChallenges: () => announceChallenges(db, now),
          eventReminders: () => sendEventReminders(db, now),
          githubInvites: () => syncGithubInvites(db, now),
        }

  const results = await Promise.allSettled(
    Object.entries(jobs).map(async ([name, run]) => [name, await run()] as const),
  )
  for (const r of results) {
    if (r.status === 'fulfilled') console.info(`[cron] ${r.value[0]}`, r.value[1])
    else console.error('[cron] job failed', r.reason)
  }
}
