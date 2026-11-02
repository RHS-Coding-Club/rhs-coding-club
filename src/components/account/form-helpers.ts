import type { z } from 'zod'

/** First message per top-level field from a failed safeParse. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_')
    out[key] ??= issue.message
  }
  return out
}

/**
 * A readable message from a failed server function call. Validation errors
 * arrive as a JSON list of Zod issues; rule errors carry their own message.
 */
export function serverMessage(
  err: unknown,
  fallback = 'Something went wrong. Try again.',
) {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : ''
  if (!raw) return fallback
  if (raw.trim().startsWith('[')) {
    try {
      const issues = JSON.parse(raw) as { message?: string }[]
      return issues[0]?.message ?? fallback
    } catch {
      return fallback
    }
  }
  if (raw === 'UNAUTHORIZED') return 'Your session ended. Sign in again.'
  if (raw === 'FORBIDDEN') return 'You don’t have permission to do that.'
  return raw
}
