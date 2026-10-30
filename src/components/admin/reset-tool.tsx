import { useMemo, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  CheckCircle2,
  Download,
  Flame,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import ElectricBorder from '#/components/bits/ElectricBorder'
import SpotlightCard from '#/components/bits/SpotlightCard'
import Stepper, { Step } from '#/components/bits/Stepper'
import { RaisedButton } from '#/components/raised-button'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { useIsDark } from '#/hooks/use-is-dark'
import {
  RESET_CONFIRM,
  RESET_GROUPS,
  RESET_INFO,
  RESET_PRESETS,
} from '#/lib/schemas/reset'
import type { ResetAction } from '#/lib/schemas/reset'
import { cn } from '#/lib/utils'
import { downloadBackup, resetData } from '#/server/reset'
import type { ResetResult } from '#/services/reset'

type Counts = Record<ResetAction, number>
type PresetId = (typeof RESET_PRESETS)[number]['id']

const PRESET_ICON: Record<PresetId, typeof RotateCcw> = {
  'new-year': Sparkles,
  'new-semester': RotateCcw,
  sample: ShieldCheck,
  content: ShieldAlert,
  full: Flame,
}

const SPOTLIGHT_VARS = {
  '--spotlight-card-surface': 'var(--bits-surface)',
  '--spotlight-card-border': 'var(--bits-edge)',
} as React.CSSProperties

const same = (a: Set<ResetAction>, b: readonly ResetAction[]) =>
  a.size === b.length && b.every((x) => a.has(x))

/**
 * The admin reset tool in React Bits Stepper: pick a preset or individual
 * actions (each with a live count), download a backup, then type RESET.
 * The Stepper is controlled and our own buttons drive it, so a step can
 * refuse to move on. Presets sit on Spotlight Cards; the full wipe gets a
 * red Electric Border so nobody mistakes it for the others.
 */
export function ResetTool({
  counts,
  initialDark,
}: {
  counts: Counts
  initialDark: boolean
}) {
  const router = useRouter()
  const dark = useIsDark(initialDark)
  const backup = useServerFn(downloadBackup)
  const run = useServerFn(resetData)

  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<Set<ResetAction>>(new Set())
  const [backedUp, setBackedUp] = useState(false)
  const [skipBackup, setSkipBackup] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [typed, setTyped] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<ResetResult | null>(null)

  const chosen = useMemo(
    () => RESET_GROUPS.flatMap((g) => g.actions).filter((a) => selected.has(a)),
    [selected],
  )
  const destructive = chosen.some((a) => RESET_INFO[a].destructive)
  const preset = RESET_PRESETS.find((p) => same(selected, p.actions))

  const toggle = (a: ResetAction, on: boolean) =>
    setSelected((s) => {
      const next = new Set(s)
      if (on) next.add(a)
      else next.delete(a)
      return next
    })

  async function saveBackup() {
    setDownloading(true)
    try {
      const json = await backup()
      const blob = new Blob([json], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `rhs-coding-club-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(a.href)
      setBackedUp(true)
      toast.success('Backup downloaded.')
    } catch {
      toast.error('Could not make the backup. Try again.')
    } finally {
      setDownloading(false)
    }
  }

  async function confirmReset() {
    setRunning(true)
    try {
      const res = await run({ data: { actions: chosen, confirm: 'RESET' } })
      setResult(res)
      await router.invalidate()
      toast.success('Reset complete.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'The reset did not run.')
    } finally {
      setRunning(false)
    }
  }

  function startOver() {
    setResult(null)
    setSelected(new Set())
    setBackedUp(false)
    setSkipBackup(false)
    setTyped('')
    setStep(1)
  }

  if (result) return <Done result={result} onAgain={startOver} />

  return (
    <Stepper
      step={step}
      onStepChange={setStep}
      linear
      showFooter={false}
      theme={dark ? 'dark' : 'light'}
      accentColor={destructive ? '#e5484d' : '#5fb2ee'}
      width="100%"
      radius={28}
      contentClassName="pt-6"
    >
      <Step title="Choose" description="A preset or your own list">
        <section aria-labelledby="presets-heading">
          <h2 id="presets-heading" className="text-lg font-semibold tracking-[-0.02em]">
            Presets
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {RESET_PRESETS.map((p) => {
              const Icon = PRESET_ICON[p.id]
              const active = preset?.id === p.id
              const card = (
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(new Set(p.actions))}
                  className="focus-visible:ring-ring/50 block h-full w-full rounded-3xl text-left outline-none focus-visible:ring-3"
                >
                  <SpotlightCard
                    theme={dark ? 'dark' : 'light'}
                    spotlightColor={
                      p.id === 'full'
                        ? 'rgba(229, 72, 77, 0.9)'
                        : 'rgba(95, 178, 238, 0.9)'
                    }
                    intensity={0.16}
                    className={cn(
                      'h-full rounded-3xl! p-5 transition-shadow',
                      active && 'ring-brand-sky ring-2',
                      active && p.id === 'full' && 'ring-[#e5484d]',
                    )}
                    style={SPOTLIGHT_VARS}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span
                        className={cn(
                          'grid size-10 place-items-center rounded-2xl',
                          p.id === 'full'
                            ? 'bg-[#e5484d]/15 text-[#e5484d]'
                            : 'bg-brand-sky/12 text-brand-navy dark:text-sky-200',
                        )}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      {active && (
                        <CheckCircle2
                          className={cn(
                            'size-5',
                            p.id === 'full' ? 'text-[#e5484d]' : 'text-brand-sky',
                          )}
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className="mt-4 block font-semibold tracking-[-0.01em]">
                      {p.label}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-sm leading-relaxed">
                      {p.description}
                    </span>
                  </SpotlightCard>
                </button>
              )
              return (
                <li key={p.id}>
                  {p.id === 'full' ? (
                    <ElectricBorder
                      color="#e5484d"
                      theme={dark ? 'dark' : 'light'}
                      borderRadius={24}
                      speed={0.6}
                      chaos={0.3}
                      thickness={1.2}
                      strands={2}
                      glow={dark ? 0.6 : 0.35}
                      intensity={dark ? 0.7 : 0.55}
                      arcs={0.2}
                      className="h-full"
                    >
                      {card}
                    </ElectricBorder>
                  ) : (
                    card
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby="custom-heading" className="mt-10">
          <h2 id="custom-heading" className="text-lg font-semibold tracking-[-0.02em]">
            Or pick exactly what to reset
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Accounts with the admin role, and yours, are never deleted or demoted.
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            {RESET_GROUPS.map((g) => (
              <fieldset
                key={g.label}
                className="ring-border/70 rounded-3xl p-5 ring-1"
                style={{ background: 'var(--bits-surface)' }}
              >
                <legend className="sr-only">{g.label}</legend>
                <p aria-hidden="true" className="mb-3 font-medium">
                  {g.label}
                </p>
                <ul className="flex flex-col gap-1">
                  {g.actions.map((a) => {
                    const info = RESET_INFO[a]
                    const id = `reset-${a}`
                    return (
                      <li key={a}>
                        <label
                          htmlFor={id}
                          className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-2xl p-2.5 transition-colors"
                        >
                          <Checkbox
                            id={id}
                            checked={selected.has(a)}
                            onCheckedChange={(v) => toggle(a, v === true)}
                            className="mt-0.5"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="text-sm font-medium">{info.label}</span>
                              {!info.destructive && (
                                <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-300">
                                  Keeps data
                                </span>
                              )}
                            </span>
                            <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
                              {info.description}
                            </span>
                          </span>
                          <span
                            className="text-muted-foreground shrink-0 pt-0.5 text-right font-mono text-xs tabular-nums"
                            title={`${counts[a]} ${info.unit}`}
                          >
                            {counts[a].toLocaleString('en-US')}
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </fieldset>
            ))}
          </div>
        </section>

        <StepFooter>
          <p className="text-muted-foreground text-sm">
            {chosen.length === 0
              ? 'Nothing selected yet.'
              : `${chosen.length} selected${preset ? ` (${preset.label})` : ''}`}
          </p>
          <RaisedButton disabled={chosen.length === 0} onClick={() => setStep(2)}>
            Review
          </RaisedButton>
        </StepFooter>
      </Step>

      <Step title="Back up" description="Save a copy first">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">This will run</h2>
        <ul className="divide-border/70 ring-border/70 mt-4 divide-y rounded-3xl ring-1">
          {chosen.map((a) => (
            <li key={a} className="flex items-center justify-between gap-4 px-5 py-3">
              <span className="min-w-0">
                <span className="block text-sm font-medium">{RESET_INFO[a].label}</span>
                <span className="text-muted-foreground block text-xs">
                  {RESET_INFO[a].destructive ? 'Deletes data' : 'Keeps data'}
                </span>
              </span>
              <span className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums">
                {counts[a].toLocaleString('en-US')} {RESET_INFO[a].unit}
              </span>
            </li>
          ))}
        </ul>

        <div
          className="ring-border/70 mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5 ring-1"
          style={{ background: 'var(--bits-surface)' }}
        >
          <div className="max-w-lg">
            <p className="font-medium">Download a backup</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Every table except passwords and sessions, as one JSON file. Keep it until
              you&apos;re sure the reset did what you wanted.
            </p>
          </div>
          <RaisedButton
            variant={backedUp ? 'outline' : 'primary'}
            onClick={saveBackup}
            loading={downloading}
            loadingText="Preparing…"
          >
            {backedUp ? <CheckCircle2 /> : <Download />}
            {backedUp ? 'Downloaded' : 'Download backup'}
          </RaisedButton>
        </div>
        {destructive && !backedUp && (
          <label className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
            <Checkbox
              checked={skipBackup}
              onCheckedChange={(v) => setSkipBackup(v === true)}
            />
            Continue without a backup
          </label>
        )}

        <StepFooter>
          <RaisedButton variant="ghost" onClick={() => setStep(1)}>
            Back
          </RaisedButton>
          <RaisedButton
            disabled={destructive && !backedUp && !skipBackup}
            onClick={() => setStep(3)}
          >
            Continue
          </RaisedButton>
        </StepFooter>
      </Step>

      <Step title="Confirm" description={`Type ${RESET_CONFIRM}`}>
        <div
          className={cn(
            'flex items-start gap-3 rounded-3xl p-5 ring-1',
            destructive
              ? 'bg-[#e5484d]/8 ring-[#e5484d]/30'
              : 'bg-brand-sky/8 ring-brand-sky/25',
          )}
        >
          <ShieldAlert
            className={cn(
              'mt-0.5 size-5 shrink-0',
              destructive ? 'text-[#e5484d]' : 'text-brand-sky',
            )}
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed">
            {destructive
              ? `This deletes data for ${chosen.length === 1 ? 'one action' : `${chosen.length} actions`} and can't be undone from the site. ${backedUp ? 'Your backup is the only copy.' : 'You chose not to keep a backup.'}`
              : 'This starts a new points season. Nothing is deleted.'}
          </p>
        </div>
        <div className="mt-6 max-w-sm">
          <Label htmlFor="reset-confirm">Type {RESET_CONFIRM} to confirm</Label>
          <Input
            id="reset-confirm"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="mt-2 font-mono tracking-[0.2em] uppercase"
          />
        </div>
        <StepFooter>
          <RaisedButton variant="ghost" onClick={() => setStep(2)} disabled={running}>
            Back
          </RaisedButton>
          <RaisedButton
            onClick={confirmReset}
            disabled={typed !== RESET_CONFIRM}
            loading={running}
            loadingText="Resetting…"
            className={cn(
              destructive && '[--primary-foreground:#fff] [--primary:#e5484d]',
            )}
          >
            <RotateCcw />
            {destructive ? 'Reset now' : 'Start the new season'}
          </RaisedButton>
        </StepFooter>
      </Step>
    </Stepper>
  )
}

function StepFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
      {children}
    </div>
  )
}

function Done({ result, onAgain }: { result: ResetResult; onAgain: () => void }) {
  return (
    <div
      className="ring-border/70 rounded-3xl p-8 ring-1"
      style={{ background: 'var(--bits-surface)' }}
    >
      <CheckCircle2 className="size-8 text-emerald-500" aria-hidden="true" />
      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">Reset complete</h2>
      <ul className="text-muted-foreground mt-4 flex flex-col gap-1.5 text-sm">
        {result.ran.map((a) => (
          <li key={a}>
            <span className="text-foreground">{RESET_INFO[a].label}</span>
            {' · '}
            {(result.counts[a] ?? 0).toLocaleString('en-US')} {RESET_INFO[a].unit}
          </li>
        ))}
        {result.filesRemoved > 0 && (
          <li>{result.filesRemoved} images removed from storage</li>
        )}
      </ul>
      <RaisedButton variant="outline" className="mt-6" onClick={onAgain}>
        Done
      </RaisedButton>
    </div>
  )
}
