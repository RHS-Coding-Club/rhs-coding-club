import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Award, Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { BadgeForm, NEW_BADGE } from '#/components/admin/badges/badge-form'
import { BadgeHolders } from '#/components/admin/badges/badge-holders'
import { BadgeMedal } from '#/components/admin/badges/badge-preview'
import { EmptyState } from '#/components/empty-state'
import { RaisedButton } from '#/components/raised-button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { RARITY_COLOR, RARITY_LABEL, criteriaSummary } from '#/lib/schemas/badges'
import { serverErrorMessage } from '#/lib/schemas/community'
import { cn } from '#/lib/utils'
import { deleteBadge, listBadgesAdmin } from '#/server/badges'

const searchSchema = z.object({
  /** Badge open in the side sheet, or "new". */
  badge: z.string().max(64).optional(),
  view: z.enum(['details', 'holders']).optional().catch(undefined),
})

export const Route = createFileRoute('/_admin/admin/badges')({
  validateSearch: searchSchema,
  loader: () => listBadgesAdmin(),
  head: () => ({ meta: [{ title: 'Badges · Admin · RHS Coding Club' }] }),
  component: AdminBadges,
})

function AdminBadges() {
  const badges = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const router = useRouter()
  const remove = useServerFn(deleteBadge)
  const open = search.badge === 'new' ? null : badges.find((b) => b.id === search.badge)
  const isNew = search.badge === 'new'
  const view = search.view ?? 'details'

  const setOpen = (badge: string | undefined, nextView?: 'details' | 'holders') =>
    void navigate({ search: { badge, view: nextView }, resetScroll: false })

  async function onDelete(id: string) {
    try {
      await remove({ data: { id } })
      toast.success('Badge deleted.')
      setOpen(undefined)
      await router.invalidate()
    } catch (err) {
      toast.error(serverErrorMessage(err))
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Recognition"
        title="Badges"
        description="Automatic badges unlock when a member reaches the threshold; custom ones are handed out here."
        actions={
          <RaisedButton onClick={() => setOpen('new')}>
            <Plus aria-hidden="true" />
            New badge
          </RaisedButton>
        }
      />

      {badges.length === 0 ? (
        <EmptyState
          icon={<Award />}
          title="No badges yet."
          action={
            <RaisedButton onClick={() => setOpen('new')}>
              Create the first one
            </RaisedButton>
          }
        >
          Badges show on profiles and the leaderboard.
        </EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {badges.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => setOpen(b.id)}
                className={cn(
                  'border-border hover:bg-muted/50 focus-visible:ring-ring/50 flex h-full w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors outline-none focus-visible:ring-3',
                  search.badge === b.id && 'bg-muted',
                )}
              >
                <BadgeMedal imageKey={b.imageKey} rarity={b.rarity} muted={!b.isActive} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium">{b.name}</span>
                    {!b.isActive && (
                      <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px]">
                        Inactive
                      </span>
                    )}
                  </span>
                  <span
                    className="block text-xs font-medium"
                    style={{ color: RARITY_COLOR[b.rarity] }}
                  >
                    {RARITY_LABEL[b.rarity]}
                  </span>
                  <span className="text-muted-foreground mt-1.5 block text-xs">
                    {criteriaSummary(b)}
                  </span>
                </span>
                <span className="text-right">
                  <span className="tabular block font-mono text-lg">{b.holders}</span>
                  <span className="text-muted-foreground text-[11px]">
                    {b.holders === 1 ? 'holder' : 'holders'}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={Boolean(search.badge)} onOpenChange={(o) => !o && setOpen(undefined)}>
        <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-lg">
          <SheetHeader className="border-border border-b">
            <SheetTitle>{isNew ? 'New badge' : (open?.name ?? 'Badge')}</SheetTitle>
            <SheetDescription>
              {isNew
                ? 'Automatic badges are awarded as soon as you save.'
                : open
                  ? criteriaSummary(open)
                  : 'This badge no longer exists.'}
            </SheetDescription>
          </SheetHeader>
          <div className="p-4">
            {isNew ? (
              <BadgeForm initial={NEW_BADGE} onSaved={(id) => setOpen(id)} />
            ) : open ? (
              <Tabs
                value={view}
                onValueChange={(v) => setOpen(open.id, v as 'details' | 'holders')}
              >
                <TabsList className="mb-5">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="holders">
                    Holders
                    <span className="text-muted-foreground tabular ml-1.5 font-mono text-[10px]">
                      {open.holders}
                    </span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <BadgeForm
                    key={`${open.id}-${open.updatedAt.getTime()}`}
                    initial={{
                      id: open.id,
                      name: open.name,
                      description: open.description,
                      imageKey: open.imageKey,
                      rarity: open.rarity,
                      criteriaType: open.criteriaType,
                      threshold: open.threshold,
                      autoAward: open.autoAward,
                      sortOrder: open.sortOrder,
                      isActive: open.isActive,
                    }}
                    onSaved={() => undefined}
                  />
                  <div className="border-border mt-8 flex items-center justify-between gap-4 border-t pt-5">
                    <p className="text-muted-foreground text-sm">
                      Deleting removes it from {open.holders}{' '}
                      {open.holders === 1 ? 'member' : 'members'}.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <RaisedButton variant="ghost" size="sm">
                          <Trash2 aria-hidden="true" />
                          Delete badge
                        </RaisedButton>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {open.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Every member who holds it loses it, and the record is gone. To
                            stop awarding and showing it but keep who earned it, switch it
                            to inactive instead.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => onDelete(open.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TabsContent>
                <TabsContent value="holders">
                  <BadgeHolders badgeId={open.id} badgeName={open.name} />
                </TabsContent>
              </Tabs>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
