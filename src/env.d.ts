// Secrets are not in wrangler.jsonc (they come from .dev.vars locally and
// `wrangler secret put` in production), so `wrangler types` only knows about
// them when .dev.vars exists. Declaring them here keeps type-checking honest
// in CI and documents every secret the app expects. Keep in sync with
// .dev.vars.example.
declare namespace Cloudflare {
  interface Env {
    BETTER_AUTH_SECRET: string
    BOOTSTRAP_ADMIN_EMAILS: string
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    GITHUB_CLIENT_ID: string
    GITHUB_CLIENT_SECRET: string
    RESEND_API_KEY: string
    EMAIL_FROM: string
    GITHUB_TOKEN: string
  }
}
