import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import { oauthProviderClient } from '@better-auth/oauth-provider/client'
import { ROLES } from '#/lib/roles'

export const authClient = createAuthClient({
  plugins: [
    // Carries an MCP app's signed sign-in request through /login and /consent.
    oauthProviderClient(),
    inferAdditionalFields({
      user: {
        role: { type: [...ROLES], required: false, input: false },
        avatarKey: { type: 'string', required: false, input: false },
      },
    }),
  ],
})

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} = authClient
