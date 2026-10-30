import { useId, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RotateCcw,
  Undo2,
} from 'lucide-react'
import { toast } from 'sonner'
import { RaisedButton } from '#/components/raised-button'
import { UserAvatar } from '#/components/user-avatar'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { fmtDate } from '#/lib/format'
import { highlightLanguage } from '#/lib/schemas/challenges'
import type { ReviewDecision } from '#/lib/schemas/challenges'
import { reviewSubmission } from '#/server/challenges'
import type { SubmissionDetail } from '#/services/challenges'
import { CodeView } from './code-view'
import { DifficultyPill, ReviewStatusPill } from './meta'

/**
 * One submission, everything a reviewer needs, and the decision buttons.
 * Pass settles the challenge's points; fail or reopen takes them back.
 */
export function ReviewPanel({
  submission: sub,
  onPrev,
  onNext,
  onReviewed,
}: {
  submission: SubmissionDetail
  onPrev?: () => void
  onNext?: () => void
  /** Called after a decision lands, with what changed. */
  onReviewed: (decision: ReviewDecision) => void | Promise<void>
}) {
  const review = useServerFn(reviewSubmission)
  const feedbackId = useId()
  const [feedback, setFeedback] = useState(sub.feedback ?? '')
  const [busy, setBusy] = useState<ReviewDecision | null>(null)
  const first = sub.userName.split(' ')[0]

  async function decide(status: ReviewDecision) {
    setBusy(status)
    try {
      const res = await review({ data: { id: sub.id, status, feedback } })
      const pts =
        res.delta > 0
          ? `+${res.delta} pts to ${first}.`
          : res.delta < 0
            ? `${res.delta} pts from ${first}.`
            : 'No points changed.'
      const title =
        status === 'pass'
          ? 'Passed'
          : status === 'fail'
            ? 'Marked as needs work'
            : 'Reopened'
      toast.success(title, {
        description:
          res.awarded.length > 0
            ? `${pts} New badge${res.awarded.length > 1 ? 's' : ''}: ${res.awarded.map((b) => b.name).join(', ')}.`
            : pts,
      })
      await onReviewed(status)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the review.')
    } finally {
      setBusy(null)
    }
  }

  const hl = highlightLanguage(sub.language)

  return (
    <article
      aria-label={`Submission from ${sub.userName}`}
      className="flex flex-col gap-5"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            user={{
              name: sub.userName,
              image: sub.userImage,
              avatarKey: sub.userAvatarKey,
            }}
            className="size-11"
          />
          <div className="min-w-0">
            <Link
              to="/members/$id"
              params={{ id: sub.userId }}
              className="block truncate font-semibold hover:underline"
            >
              {sub.userName}
            </Link>
            <p className="text-muted-foreground truncate text-xs">{sub.userEmail}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <RaisedButton
            variant="ghost"
            size="icon"
            onClick={onPrev}
            disabled={!onPrev}
            aria-label="Previous submission (k)"
            title="Previous (k)"
          >
            <ChevronUp aria-hidden="true" />
          </RaisedButton>
          <RaisedButton
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!onNext}
            aria-label="Next submission (j)"
            title="Next (j)"
          >
            <ChevronDown aria-hidden="true" />
          </RaisedButton>
        </div>
      </header>

      <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            to="/admin/challenges/$id"
            params={{ id: sub.challengeId }}
            className="min-w-0 font-medium hover:underline"
          >
            <span className="text-muted-foreground font-mono text-xs">
              Week {sub.weekNo}
            </span>{' '}
            {sub.challengeTitle}
          </Link>
          <span className="flex items-center gap-2">
            <DifficultyPill difficulty={sub.difficulty} />
            <span className="tabular font-mono text-xs">{sub.points} pts</span>
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm xl:grid-cols-[auto_auto_auto_1fr]">
          <Meta term="Status">
            <ReviewStatusPill status={sub.status} />
          </Meta>
          <Meta term="Language">{sub.language}</Meta>
          <Meta term="Platform">{sub.platform}</Meta>
          <Meta term="Submitted">{fmtDate(sub.submittedAt, 'datetime')}</Meta>
        </dl>
        {sub.reviewedAt && (
          <p className="text-muted-foreground text-xs">
            Reviewed {fmtDate(sub.reviewedAt, 'datetime')}
            {sub.reviewerName && ` by ${sub.reviewerName}`}
          </p>
        )}
        {/* Submissions imported from the old site have pasted code, no link. */}
        {sub.url && (
          <RaisedButton asChild variant="outline" className="w-full justify-between">
            <a href={sub.url} target="_blank" rel="noopener noreferrer">
              <span className="truncate font-mono text-xs">
                {sub.url.replace(/^https:\/\//, '')}
              </span>
              <ExternalLink aria-hidden="true" />
            </a>
          </RaisedButton>
        )}
      </div>

      {sub.code ? (
        <section aria-label="Pasted code">
          <CodeView code={sub.code} language={hl} />
        </section>
      ) : (
        <p className="text-muted-foreground border-border rounded-lg border border-dashed px-4 py-6 text-center text-sm">
          No code pasted. Open the link to review it.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={feedbackId}>
          Feedback{' '}
          <span className="text-muted-foreground font-normal">
            (the member sees this)
          </span>
        </Label>
        <Textarea
          id={feedbackId}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={`Nice work, ${first}. Or: what to fix before it passes.`}
          className="min-h-24"
          maxLength={2000}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <RaisedButton
          onClick={() => decide('pass')}
          loading={busy === 'pass'}
          loadingText="Saving"
          disabled={busy !== null}
        >
          <Check aria-hidden="true" />
          {sub.status === 'pass' ? 'Update pass' : `Pass, +${sub.points} pts`}
        </RaisedButton>
        <RaisedButton
          variant="outline"
          onClick={() => decide('fail')}
          loading={busy === 'fail'}
          loadingText="Saving"
          disabled={busy !== null}
        >
          <RotateCcw aria-hidden="true" />
          Needs work
        </RaisedButton>
        {sub.status !== 'pending' && (
          <RaisedButton
            variant="ghost"
            onClick={() => decide('pending')}
            loading={busy === 'pending'}
            loadingText="Saving"
            disabled={busy !== null}
          >
            <Undo2 aria-hidden="true" />
            Reopen
          </RaisedButton>
        )}
      </div>
      {sub.status === 'pass' && (
        <p className="text-muted-foreground -mt-2 text-xs">
          Needs work or reopen takes the {sub.points} points back.
        </p>
      )}
    </article>
  )
}

function Meta({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{term}</dt>
      <dd className="mt-0.5 truncate">{children}</dd>
    </div>
  )
}
