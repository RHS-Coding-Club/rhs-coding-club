// Shared by the widget and the server checks. Ships to the browser, so nothing
// here is secret: a Turnstile site key is public by design.

/** Null turns the widget off, which is the default in local dev and tests. */
const PRODUCTION_SITE_KEY = '0x4AAAAAAFxAlSpwkDWmU3pz'

export const TURNSTILE_SITE_KEY: string | null =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ||
  (import.meta.env.PROD ? PRODUCTION_SITE_KEY : null)

export const TURNSTILE_ACTIONS = {
  signup: 'signup',
  forgotPassword: 'forgot_password',
  contact: 'contact',
  newsletter: 'newsletter',
} as const
export type TurnstileAction = (typeof TURNSTILE_ACTIONS)[keyof typeof TURNSTILE_ACTIONS]

/** Carries the token on Better Auth requests, whose bodies it validates itself. */
export const TURNSTILE_HEADER = 'x-turnstile-token'

export const TURNSTILE_FAILED = 'We could not confirm you are human. Please try again.'
