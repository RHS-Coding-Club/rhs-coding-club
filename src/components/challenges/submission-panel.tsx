import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { ExternalLink, Lock, LogIn, Send, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import ClickSpark from '#/components/bits/ClickSpark'
import { RaisedButton } from '#/components/raised-button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { fmtDate } from '#/lib/format'
import { hasRole } from '#/lib/roles'
import type { Role } from '#/lib/roles'
import {
  MAX_CODE,
  SUBMISSION_LANGUAGES,
  SUBMISSION_PLATFORMS,
  memberProgress,
  submitSolutionSchema,
} from '#/lib/schemas/challenges'
import { cn } from '#/lib/utils'
import { submitSolution } from '#/server/challenges'
import { ProgressMark } from './meta'

export interface MySubmission {
  id: string
  language: string
  platform: string
  url: string
  code: string | null
  status: 'pending' | 'pass' | 'fail'
  feedback: string | null
  reviewedAt: Date | null
  submittedAt: Date
}

type FieldErrors = Partial<Record<'language' | 'platform' | 'url' | 'code', string>>

/**
 * The right-hand panel on a challenge: who you are decides what you see.
 * Signed out gets a sign-in button, guests an "apply to join" nudge, members
 * the form (or their submission and the reviewer's note), and officers
 * previewing an unpublished challenge a note that submissions open later.
 */
export function SubmissionPanel({
  challengeId,
  points,
  live,
  viewer,
  mine,
}: {
  challengeId: string
  points: number
  live: boolean
  viewer: { role: Role } | null
  mine: MySubmission | null
}) {
  const shell = (children: React.ReactNode) => (
    <aside
      aria-labelledby="submit-heading"
      className="ring-border/70 rounded-3xl p-6 ring-1 sm:p-7"
      style={{ background: 'var(--bits-surface)' }}
    >
      {children}
    </aside>
  )

  if (!viewer) {
    return shell(
      <Gate
        title="Sign in to submit"
        body={`Members earn ${points} points for a passing solution. Sign in to send yours.`}
        action={
          <RaisedButton asChild size="lg" className="w-full">
            <Link to="/login" search={{ redirect: `/challenges/${challengeId}` }}>
              <LogIn aria-hidden="true" />
              Sign in
            </Link>
          </RaisedButton>
        }
      />,
    )
  }

  if (!hasRole(viewer.role, 'member')) {
    return shell(
      <Gate
        title="Members submit solutions"
        body="You can read every challenge. Once your membership is approved, you can submit and earn points."
        action={
          <RaisedButton asChild size="lg" className="w-full">
            <Link to="/join">
              <UserPlus aria-hidden="true" />
              Apply to join
            </Link>
          </RaisedButton>
        }
      />,
    )
  }

  if (!live) {
    return shell(
      <Gate
        title="Submissions open at launch"
        body="This is a preview. Members can submit once the challenge goes live."
      />,
    )
  }

  return shell(<MemberPanel challengeId={challengeId} points={points} mine={mine} />)
}

function Gate({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 id="submit-heading" className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
      {action}
    </div>
  )
}

function MemberPanel({
  challengeId,
  points,
  mine,
}: {
  challengeId: string
  points: number
  mine: MySubmission | null
}) {
  const progress = memberProgress(mine?.status)
  // Pending submissions show a summary first; failed ones open the form so
  // the member can fix and resend.
  const [editing, setEditing] = useState(!mine || mine.status === 'fail')

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="submit-heading" className="text-xl font-semibold tracking-tight">
          {mine ? 'Your submission' : 'Submit a solution'}
        </h2>
        {mine && <ProgressMark progress={progress} />}
      </div>

      {mine && mine.status !== 'pending' && mine.feedback && (
        <figure
          className={cn(
            'rounded-2xl px-4 py-3.5 text-sm ring-1 ring-inset',
            mine.status === 'pass'
              ? 'bg-emerald-500/8 ring-emerald-500/20'
              : 'bg-amber-500/8 ring-amber-500/25',
          )}
        >
          <figcaption className="text-muted-foreground mb-1 text-xs">
            Reviewer note
            {mine.reviewedAt && ` · ${fmtDate(mine.reviewedAt, 'short')}`}
          </figcaption>
          <blockquote className="leading-relaxed whitespace-pre-line">
            {mine.feedback}
          </blockquote>
        </figure>
      )}

      {mine && !editing && (
        <SubmissionSummary mine={mine} points={points} onEdit={() => setEditing(true)} />
      )}

      {editing && (
        <SubmitForm
          challengeId={challengeId}
          mine={mine}
          onCancel={mine ? () => setEditing(false) : undefined}
          onDone={() => setEditing(false)}
        />
      )}

      {!mine && (
        <p className="text-muted-foreground text-xs leading-relaxed">
          A pass is worth{' '}
          <span className="text-foreground font-mono font-medium">{points} pts</span>. You
          can update your submission until it is reviewed.
        </p>
      )}
    </div>
  )
}

function SubmissionSummary({
  mine,
  points,
  onEdit,
}: {
  mine: MySubmission
  points: number
  onEdit: () => void
}) {
  const locked = mine.status === 'pass'
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs">Language</dt>
          <dd className="mt-0.5 font-medium">{mine.language}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Platform</dt>
          <dd className="mt-0.5 font-medium">{mine.platform}</dd>
        </div>
        {/* Submissions imported from the old site have pasted code, no link. */}
        {mine.url && (
          <div className="col-span-2">
            <dt className="text-muted-foreground text-xs">Link</dt>
            <dd className="mt-0.5 min-w-0">
              <a
                href={mine.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary inline-flex max-w-full items-center gap-1.5 font-mono text-xs underline-offset-4 hover:underline"
              >
                <span className="truncate">{mine.url.replace(/^https:\/\//, '')}</span>
                <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
              </a>
            </dd>
          </div>
        )}
        <div className="col-span-2">
          <dt className="text-muted-foreground text-xs">Submitted</dt>
          <dd className="mt-0.5">{fmtDate(mine.submittedAt, 'datetime')}</dd>
        </div>
      </dl>

      {locked ? (
        <p className="text-muted-foreground flex items-start gap-2 text-sm">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Passed and locked.{' '}
            <span className="text-foreground font-mono font-medium">+{points} pts</span>{' '}
            are on the leaderboard.
          </span>
        </p>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            {mine.status === 'fail'
              ? 'Not a pass yet. Read the note, fix it up, and send it again.'
              : 'In the review queue. You can still swap the link or code.'}
          </p>
          <RaisedButton variant="outline" onClick={onEdit}>
            {mine.status === 'fail' ? 'Try again' : 'Update submission'}
          </RaisedButton>
        </>
      )}
    </div>
  )
}

function SubmitForm({
  challengeId,
  mine,
  onCancel,
  onDone,
}: {
  challengeId: string
  mine: MySubmission | null
  onCancel?: () => void
  onDone: () => void
}) {
  const router = useRouter()
  const submit = useServerFn(submitSolution)
  const [language, setLanguage] = useState(mine?.language ?? '')
  const [platform, setPlatform] = useState(mine?.platform ?? '')
  const [url, setUrl] = useState(mine?.url ?? '')
  const [code, setCode] = useState(mine?.code ?? '')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const parsed = submitSolutionSchema.safeParse({
      challengeId,
      language,
      platform,
      url,
      code: code || undefined,
    })
    if (!parsed.success) {
      const next: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors
        next[key] ??= issue.message
      }
      setErrors(next)
      return
    }
    setErrors({})
    setPending(true)
    try {
      const res = await submit({ data: parsed.data })
      toast.success(res.resubmitted ? 'Submission updated' : 'Submitted', {
        description: 'An officer will review it soon.',
      })
      onDone()
      await router.invalidate()
    } catch (err) {
      setFormError(
        err instanceof Error && err.message
          ? err.message
          : 'Could not submit. Try again.',
      )
    } finally {
      setPending(false)
    }
  }

  const err = (k: keyof FieldErrors) =>
    errors[k] ? (
      <p id={`${k}-error`} role="alert" className="text-destructive text-xs">
        {errors[k]}
      </p>
    ) : null

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor="sub-language">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger
              id="sub-language"
              className="w-full"
              aria-invalid={Boolean(errors.language)}
              aria-describedby={errors.language ? 'language-error' : undefined}
            >
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              {SUBMISSION_LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {err('language')}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor="sub-platform">Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger
              id="sub-platform"
              className="w-full"
              aria-invalid={Boolean(errors.platform)}
              aria-describedby={errors.platform ? 'platform-error' : undefined}
            >
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              {SUBMISSION_PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {err('platform')}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sub-url">Link to your solution</Label>
        <Input
          id="sub-url"
          type="url"
          inputMode="url"
          placeholder="https://github.com/you/week-7"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-invalid={Boolean(errors.url)}
          aria-describedby={errors.url ? 'url-error' : undefined}
          className="font-mono text-sm"
        />
        {err('url')}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="sub-code">
            Code <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <span
            className={cn(
              'tabular font-mono text-[11px]',
              code.length > MAX_CODE ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {code.length.toLocaleString('en-US')} / {MAX_CODE.toLocaleString('en-US')}
          </span>
        </div>
        <Textarea
          id="sub-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          placeholder="Paste it here too, if you like. It helps the reviewer."
          aria-invalid={Boolean(errors.code)}
          aria-describedby={errors.code ? 'code-error' : undefined}
          className="max-h-72 min-h-28 font-mono text-[13px] leading-relaxed md:text-[13px]"
        />
        {err('code')}
      </div>

      {formError && (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      )}

      <div className="flex gap-2">
        <ClickSpark
          sparkColor={['#5fb2ee', '#9ccbf2', '#ffffff']}
          sparkCount={10}
          sparkRadius={34}
          sparkSize={10}
          shape="line"
          className="flex-1"
          disabled={pending}
        >
          <RaisedButton
            type="submit"
            size="lg"
            className="w-full"
            loading={pending}
            loadingText="Sending"
          >
            <Send aria-hidden="true" />
            {mine ? 'Resubmit for review' : 'Submit for review'}
          </RaisedButton>
        </ClickSpark>
        {onCancel && (
          <RaisedButton type="button" variant="ghost" size="lg" onClick={onCancel}>
            Cancel
          </RaisedButton>
        )}
      </div>
    </form>
  )
}
