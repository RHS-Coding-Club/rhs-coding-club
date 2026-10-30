import { useEffect, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, UserMinus, UserPlus } from 'lucide-react'
import { RaisedButton } from '#/components/raised-button'
import { UserAvatar } from '#/components/user-avatar'
import { Input } from '#/components/ui/input'
import { Skeleton } from '#/components/ui/skeleton'
import { fmtDate } from '#/lib/format'
import { serverErrorMessage } from '#/lib/schemas/community'
import {
  awardBadgeToMember,
  listBadgeHolders,
  revokeBadgeFromMember,
  searchBadgeMembers,
} from '#/server/badges'

function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

/**
 * Who holds a badge, plus a member search to hand it out by hand. Awards and
 * revokes go through the badge engine's awardBadge/revokeBadge.
 */
export function BadgeHolders({
  badgeId,
  badgeName,
}: {
  badgeId: string
  badgeName: string
}) {
  const router = useRouter()
  const qc = useQueryClient()
  const fetchHolders = useServerFn(listBadgeHolders)
  const fetchMembers = useServerFn(searchBadgeMembers)
  const award = useServerFn(awardBadgeToMember)
  const revoke = useServerFn(revokeBadgeFromMember)
  const [query, setQuery] = useState('')
  const q = useDebounced(query)
  const [busy, setBusy] = useState<string | null>(null)

  const holders = useQuery({
    queryKey: ['badge-holders', badgeId],
    queryFn: () => fetchHolders({ data: { id: badgeId } }),
  })
  const members = useQuery({
    queryKey: ['badge-member-search', q],
    queryFn: () => fetchMembers({ data: { query: q } }),
    enabled: q.trim().length > 0,
  })
  const held = new Set(holders.data?.map((h) => h.userId))

  async function act(userId: string, kind: 'award' | 'revoke', name: string) {
    setBusy(userId)
    try {
      if (kind === 'award') await award({ data: { badgeId, userId } })
      else await revoke({ data: { badgeId, userId } })
      toast.success(
        kind === 'award'
          ? `Gave ${badgeName} to ${name}.`
          : `Took ${badgeName} from ${name}.`,
      )
      await qc.invalidateQueries({ queryKey: ['badge-holders', badgeId] })
      await router.invalidate()
    } catch (err) {
      toast.error(serverErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="award-heading" className="flex flex-col gap-3">
        <h3 id="award-heading" className="font-medium">
          Award by hand
        </h3>
        <div className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members by name or email"
            aria-label="Search members"
            className="pl-9"
          />
        </div>
        {q.trim() && (
          <ul
            className="border-border divide-border divide-y rounded-lg border"
            aria-live="polite"
          >
            {members.isLoading ? (
              <li className="p-3">
                <Skeleton className="h-8 w-full" />
              </li>
            ) : members.data?.length ? (
              members.data.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-3 py-2">
                  <UserAvatar user={u} className="size-8" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{u.email}</p>
                  </div>
                  {held.has(u.id) ? (
                    <span className="text-muted-foreground text-xs">Has it</span>
                  ) : (
                    <RaisedButton
                      size="sm"
                      loading={busy === u.id}
                      onClick={() => act(u.id, 'award', u.name)}
                    >
                      <UserPlus aria-hidden="true" />
                      Award
                    </RaisedButton>
                  )}
                </li>
              ))
            ) : (
              <li className="text-muted-foreground px-3 py-4 text-center text-sm">
                No members match. Guests can’t hold badges.
              </li>
            )}
          </ul>
        )}
      </section>

      <section aria-labelledby="holders-heading" className="flex flex-col gap-3">
        <h3 id="holders-heading" className="font-medium">
          Holders
          {holders.data && (
            <span className="text-muted-foreground tabular ml-2 font-mono text-xs">
              {holders.data.length}
            </span>
          )}
        </h3>
        {holders.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : holders.data?.length ? (
          <ul className="border-border divide-border divide-y rounded-lg border">
            {holders.data.map((h) => (
              <li key={h.userId} className="flex items-center gap-3 px-3 py-2">
                <UserAvatar user={h} className="size-8" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{h.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {fmtDate(h.awardedAt, 'date')} ·{' '}
                    {h.awardedByName ? `by ${h.awardedByName}` : 'automatic'}
                  </p>
                </div>
                <RaisedButton
                  size="sm"
                  variant="ghost"
                  loading={busy === h.userId}
                  onClick={() => act(h.userId, 'revoke', h.name)}
                  aria-label={`Revoke from ${h.name}`}
                >
                  <UserMinus aria-hidden="true" />
                  Revoke
                </RaisedButton>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground border-border rounded-lg border border-dashed px-4 py-8 text-center text-sm">
            Nobody has this badge yet.
          </p>
        )}
      </section>
    </div>
  )
}
