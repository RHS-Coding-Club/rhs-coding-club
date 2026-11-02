import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { DatabaseBackup, Download } from 'lucide-react'
import { toast } from 'sonner'
import { RaisedButton } from '#/components/raised-button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Switch } from '#/components/ui/switch'
import { MIN_BACKUPS_KEPT, R2_FREE_BYTES, backupsKept, formatBytes } from '#/lib/backups'
import { fmtDate } from '#/lib/format'
import { BACKUP_FREQUENCIES, backupSchema } from '#/lib/settings'
import type { BackupFrequency, SettingValue } from '#/lib/settings'
import { downloadStoredBackup, runBackupNow, saveBackupSettings } from '#/server/backups'
import type { getBackups } from '#/server/backups'

const FREQUENCY_LABEL: Record<BackupFrequency, string> = {
  daily: 'Every day',
  weekly: 'Every week',
  monthly: 'Every 30 days',
}

type Overview = Awaited<ReturnType<typeof getBackups>>

const when = (value: Date | number) => `${fmtDate(value)} · ${fmtDate(value, 'time')}`

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ring-border/70 bg-card rounded-3xl p-6 ring-1">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function BackupManager({ overview }: { overview: Overview }) {
  const router = useRouter()
  const save = useServerFn(saveBackupSettings)
  const runNow = useServerFn(runBackupNow)
  const download = useServerFn(downloadStoredBackup)
  const { status, backups, usage } = overview

  const [enabled, setEnabled] = useState(overview.settings.enabled)
  const [frequency, setFrequency] = useState(overview.settings.frequency)
  const [retention, setRetention] = useState(String(overview.settings.retentionDays))
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)

  const parsed = backupSchema.safeParse({
    enabled,
    frequency,
    retentionDays: Number(retention),
  })
  const draft: SettingValue<'backup'> | null = parsed.success ? parsed.data : null

  const latest = backups.at(0)
  const copies = draft ? backupsKept(draft.frequency, draft.retentionDays) : null
  const estimate = copies !== null && latest ? copies * latest.size : null
  const projectedTotal = estimate !== null ? estimate + usage.fileBytes : null

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!draft) return
    setSaving(true)
    try {
      await save({ data: draft })
      await router.invalidate({ sync: true })
      toast.success('Backup settings saved.')
    } catch {
      toast.error('Could not save the settings. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function onRunNow() {
    setRunning(true)
    try {
      await runNow()
      await router.invalidate({ sync: true })
      toast.success('Backup finished.')
    } catch {
      await router.invalidate({ sync: true })
      toast.error('The backup failed. Check the Worker logs.')
    } finally {
      setRunning(false)
    }
  }

  async function onDownload(key: string) {
    setDownloading(key)
    try {
      const file = await download({ data: { key } })
      if (!file) {
        toast.error('That backup no longer exists.')
        await router.invalidate({ sync: true })
        return
      }
      const bytes = Uint8Array.from(atob(file.base64), (c) => c.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/gzip' }))
      const link = document.createElement('a')
      link.href = url
      link.download = file.key
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Could not download that backup. Try again.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="grid gap-6">
      {status.lastError && (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive ring-destructive/30 rounded-2xl p-4 text-sm ring-1"
        >
          The last backup failed
          {status.lastErrorAt ? ` on ${when(status.lastErrorAt)}` : ''}. The Worker logs
          in Cloudflare have the details. Existing backups are safe, because nothing is
          deleted until a new backup succeeds.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Schedule">
          <form onSubmit={onSave} className="grid gap-5">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="backup-enabled">Automatic backups</Label>
              <Switch
                id="backup-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="backup-frequency">How often</Label>
              <Select
                value={frequency}
                onValueChange={(value) => setFrequency(value as BackupFrequency)}
              >
                <SelectTrigger id="backup-frequency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BACKUP_FREQUENCIES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {FREQUENCY_LABEL[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="backup-retention">Delete after (days)</Label>
              <Input
                id="backup-retention"
                type="number"
                min={7}
                max={365}
                value={retention}
                aria-invalid={draft ? undefined : true}
                onChange={(e) => setRetention(e.target.value)}
              />
              <p
                className={
                  draft ? 'text-muted-foreground text-sm' : 'text-destructive text-sm'
                }
              >
                {draft
                  ? `The newest ${MIN_BACKUPS_KEPT} are always kept, however old they are.`
                  : 'Enter a whole number from 7 to 365.'}
              </p>
            </div>
            <RaisedButton
              type="submit"
              className="justify-self-start"
              disabled={!draft}
              loading={saving}
              loadingText="Saving…"
            >
              Save settings
            </RaisedButton>
          </form>
        </Panel>

        <Panel title="Storage">
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Backups kept at once</dt>
              <dd className="font-mono">{copies ?? '–'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Estimated backup storage</dt>
              <dd className="font-mono">
                {estimate !== null ? formatBytes(estimate) : '–'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Backups stored now</dt>
              <dd className="font-mono">{formatBytes(usage.backupBytes)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Uploaded files</dt>
              <dd className="font-mono">{formatBytes(usage.fileBytes)}</dd>
            </div>
            <div className="border-border/70 flex justify-between gap-4 border-t pt-3">
              <dt className="text-muted-foreground">Estimated total of free 10 GB</dt>
              <dd className="font-mono">
                {projectedTotal !== null
                  ? `${formatBytes(projectedTotal)} (${((projectedTotal / R2_FREE_BYTES) * 100).toFixed(2)}%)`
                  : '–'}
              </dd>
            </div>
          </dl>
          <p className="text-muted-foreground mt-4 text-sm">
            {latest
              ? `Based on the latest backup (${formatBytes(latest.size)}). The real number grows as the club adds data.`
              : 'The estimate appears after the first backup, because it uses that real size.'}
          </p>
        </Panel>
      </div>

      <Panel title="Stored backups">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            {status.lastSuccessAt
              ? `Last successful backup: ${when(status.lastSuccessAt)}.`
              : 'No backups yet.'}
          </p>
          <RaisedButton
            variant="outline"
            onClick={onRunNow}
            loading={running}
            loadingText="Backing up…"
          >
            <DatabaseBackup />
            Back up now
          </RaisedButton>
        </div>
        {backups.length > 0 && (
          <ul className="divide-border/70 mt-4 divide-y">
            {backups.map((backup) => (
              <li
                key={backup.key}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{when(backup.uploaded)}</p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {formatBytes(backup.size)}
                  </p>
                </div>
                <RaisedButton
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(backup.key)}
                  loading={downloading === backup.key}
                  loadingText="Preparing…"
                >
                  <Download />
                  Download
                </RaisedButton>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
