import type { z } from 'zod'

// Form helpers shared by the community and admin-tool forms (resources,
// contact, GitHub, newsletter, badges, settings). Browser-safe.

export type FieldErrors = Record<string, string | undefined>

/** First message per top-level field from a failed safeParse. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_')
    out[key] ??= issue.message
  }
  return out
}

/**
 * A readable message from a server-function failure. Validation failures
 * arrive as a Zod error whose message is the JSON list of issues; auth
 * failures as UNAUTHORIZED / FORBIDDEN; everything else carries its own text.
 */
export function serverErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Try again.',
) {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : ''
  if (!raw) return fallback
  if (raw.trimStart().startsWith('[')) {
    try {
      const issues = JSON.parse(raw) as { message?: string }[]
      const first = issues.find((i) => typeof i.message === 'string')
      if (first?.message) return first.message
    } catch {
      // not JSON; fall through
    }
  }
  if (raw === 'UNAUTHORIZED') return 'Sign in first.'
  if (raw === 'FORBIDDEN') return 'You do not have permission to do that.'
  return raw
}
