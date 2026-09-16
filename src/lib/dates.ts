/** Start of the current semester: Aug 1 for fall, Jan 1 for spring. */
export function semesterStart(now = new Date()): Date {
  const y = now.getFullYear()
  return now.getMonth() >= 7 ? new Date(y, 7, 1) : new Date(y, 0, 1)
}
