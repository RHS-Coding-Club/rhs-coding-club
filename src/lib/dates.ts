/** Start of the current semester: Aug 1 for fall, Jan 1 for spring. */
export function semesterStart(now = new Date()): Date {
  const y = now.getFullYear()
  return now.getMonth() >= 7 ? new Date(y, 7, 1) : new Date(y, 0, 1)
}

/** Monday (UTC) of the week `now` falls in, e.g. "2026-10-26". */
export function weekKey(now: Date) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}
