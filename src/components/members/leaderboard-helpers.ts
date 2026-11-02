/** "Fall 2026" / "Spring 2027" for the semester that started at `since`. */
export function semesterName(since: Date | string | undefined) {
  if (!since) return 'All time'
  // Read in UTC (with a half-day of slack) so server and browser agree.
  const d = new Date(new Date(since).getTime() + 12 * 60 * 60 * 1000)
  return `${d.getUTCMonth() >= 7 ? 'Fall' : 'Spring'} ${d.getUTCFullYear()}`
}
