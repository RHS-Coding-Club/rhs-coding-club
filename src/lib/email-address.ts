/**
 * The inbox an address really delivers to, for per-inbox limits. `+tags` reach
 * the same inbox nearly everywhere; Gmail also ignores dots and treats
 * googlemail.com as gmail.com.
 */
export function canonicalMailbox(email: string) {
  const [rawLocal = '', rawDomain = ''] = email.trim().toLowerCase().split('@')
  const local = rawLocal.split('+')[0] ?? ''
  const domain = rawDomain === 'googlemail.com' ? 'gmail.com' : rawDomain
  return `${domain === 'gmail.com' ? local.replaceAll('.', '') : local}@${domain}`
}
