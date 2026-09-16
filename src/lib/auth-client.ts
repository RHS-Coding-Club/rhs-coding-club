import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import { ROLES } from '#/lib/roles'

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: { role: { type: [...ROLES], required: false, input: false } },
    }),
  ],
})

export const { useSession, signIn, signUp, signOut } = authClient
