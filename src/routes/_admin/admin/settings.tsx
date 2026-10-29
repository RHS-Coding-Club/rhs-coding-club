import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { SettingsForm } from '#/components/admin/settings/settings-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { SETTING_GROUPS } from '#/lib/schemas/settings'
import type { SettingKey } from '#/lib/settings'
import { getSettingsAdmin } from '#/server/settings'

const KEYS = ['club-info', 'social', 'points', 'github-org', 'email'] as const

const searchSchema = z.object({
  group: z.enum(KEYS).optional().catch(undefined),
})

export const Route = createFileRoute('/_admin/admin/settings')({
  validateSearch: searchSchema,
  loader: () => getSettingsAdmin(),
  head: () => ({ meta: [{ title: 'Settings · Admin · RHS Coding Club' }] }),
  component: AdminSettings,
})

function AdminSettings() {
  const { values, meta, canEdit } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const group: SettingKey = search.group ?? 'club-info'

  return (
    <>
      <AdminPageHeader
        eyebrow="Site"
        title="Settings"
        description={
          canEdit
            ? 'Club-wide settings. Each tab saves on its own.'
            : 'Club-wide settings. Officers can look; admins make changes.'
        }
      />
      <Tabs
        value={group}
        onValueChange={(v) => void navigate({ search: { group: v as SettingKey } })}
      >
        <TabsList className="mb-6 h-auto flex-wrap">
          {SETTING_GROUPS.map((g) => (
            <TabsTrigger key={g.key} value={g.key}>
              {g.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {SETTING_GROUPS.map((g) => (
          <TabsContent key={g.key} value={g.key} className="max-w-2xl">
            <p className="text-muted-foreground mb-6 text-sm">{g.description}</p>
            <SettingsForm
              key={`${g.key}-${meta[g.key]?.updatedAt.getTime() ?? 0}`}
              group={g.key}
              value={values[g.key] as Record<string, unknown>}
              canEdit={canEdit}
              meta={meta[g.key]}
            />
          </TabsContent>
        ))}
      </Tabs>
    </>
  )
}
