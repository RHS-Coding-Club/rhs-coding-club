/**
 * How far to trust where an MCP app's sign-in goes back to. Only an https address
 * can be tied to a real site. A loopback address or a custom scheme like
 * `cursor://` reaches whatever program claims it on that computer.
 */
export function redirectKind(uri: string | undefined): 'https' | 'local' | 'other' {
  try {
    const url = new URL(uri ?? '')
    if (url.protocol === 'https:') return 'https'
    const loopback = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname)
    return url.protocol === 'http:' && loopback ? 'local' : 'other'
  } catch {
    return 'other'
  }
}
