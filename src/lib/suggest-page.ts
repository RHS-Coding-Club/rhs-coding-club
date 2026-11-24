/**
 * The page a 404 visitor probably meant, guessed from the path they typed:
 * the top-level section whose name is closest to its first segment, within a
 * couple of typos. Pure, so it's unit-tested.
 */

/** Every top-level page a typo could have been aiming at. */
const PAGES: Record<string, string> = {
  about: 'About',
  challenges: 'Challenges',
  leaderboard: 'Leaderboard',
  events: 'Events',
  projects: 'Projects',
  blog: 'Blog',
  resources: 'Resources',
  contact: 'Contact',
  join: 'Join',
  login: 'Log in',
  signup: 'Sign up',
  privacy: 'Privacy',
  terms: 'Terms',
  dashboard: 'Dashboard',
  account: 'Account',
}

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const next = row[j]
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
      prev = next
    }
  }
  return row[b.length]
}

/**
 * The page the visitor probably meant: the top-level section whose name is
 * closest to the first segment of the path, within a couple of typos. A
 * missing item inside a real section ("/blog/old-post") points at the section.
 */
export function suggestPage(pathname: string): { to: string; label: string } | null {
  const first = pathname.split('/').filter(Boolean)[0]?.toLowerCase()
  if (!first) return null
  let best: string | null = null
  let bestScore = Infinity
  for (const slug of Object.keys(PAGES)) {
    const d = distance(first, slug)
    if (d < bestScore) {
      best = slug
      bestScore = d
    }
  }
  if (!best || bestScore > Math.max(1, Math.floor(best.length / 4))) return null
  return { to: `/${best}`, label: PAGES[best] }
}
