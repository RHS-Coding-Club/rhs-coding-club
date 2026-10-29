import type { Db } from '#/db'

/** Emails RSVPed members about events starting in the next 24 hours (once each). */
export async function sendEventReminders(_db: Db, _now: Date) {
  // TODO(build): implemented by the events domain.
  return { sent: 0 }
}
