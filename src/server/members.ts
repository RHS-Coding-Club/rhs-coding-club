import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '#/db'
import { getSessionUser, requireUser } from '#/server/auth'
import { getDashboard, getLeaderboard, getMemberProfile } from '#/services/members'

/** Public: the board for one window. The signed-in viewer gets their own rank. */
export const listLeaderboard = createServerFn({ method: 'GET' })
  .validator(z.object({ window: z.enum(['semester', 'all']).default('semester') }))
  .handler(async ({ data }) => {
    const viewer = await getSessionUser()
    return getLeaderboard(getDb(), { window: data.window, viewerId: viewer?.id })
  })

/** Public: a member's profile, or null for guests and unknown ids (the route 404s). */
export const getMember = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string().min(1).max(100) }))
  .handler(({ data }) => getMemberProfile(getDb(), data.id))

/** The signed-in user's dashboard. */
export const getMyDashboard = createServerFn({ method: 'GET' })
  .middleware([requireUser])
  .handler(({ context }) => getDashboard(getDb(), context.user))
