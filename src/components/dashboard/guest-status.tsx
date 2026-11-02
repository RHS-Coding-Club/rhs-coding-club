import { Link } from '@tanstack/react-router'
import { ArrowRight, Clock3, MessageSquareWarning, Sparkles } from 'lucide-react'
import { FadeUp } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { SplitButton } from '#/components/split-button'
import { fmtDate } from '#/lib/format'
import type { LatestApplication } from '#/services/membership'

/**
 * A guest's one job on the dashboard: become a member. No application yet
 * is a big invitation; pending says it's under review and since when;
 * rejected shows the officer's note and a way back in.
 */
export function GuestStatus({ application }: { application: LatestApplication }) {
  if (!application) {
    return (
      <Panel
        icon={<Sparkles />}
        title="One step left: apply to join."
        body="Guests can look around. Members submit weekly challenges, RSVP and check in to events, earn points and badges, and put projects in the showcase. The application takes about three minutes."
        action={
          <SplitButton to="/join" size="lg">
            Apply to join
          </SplitButton>
        }
        accent
      />
    )
  }
  if (application.status === 'pending') {
    return (
      <Panel
        icon={<Clock3 />}
        title="Your application is under review."
        body={`You applied on ${fmtDate(application.createdAt)}. An officer usually reviews applications within a week; you’ll get an email either way. Until then, have a look at this week’s challenge.`}
        action={
          <RaisedButton asChild variant="outline" size="lg">
            <Link to="/challenges">
              Browse challenges
              <ArrowRight />
            </Link>
          </RaisedButton>
        }
      />
    )
  }
  return (
    <Panel
      icon={<MessageSquareWarning />}
      title="Your last application wasn’t approved."
      body={
        <>
          {application.reviewedAt && <>Reviewed {fmtDate(application.reviewedAt)}. </>}
          You can update your answers and apply again any time.
          {application.reviewNote && (
            <blockquote className="border-brand-sky text-foreground mt-4 border-l-2 pl-4 italic">
              {application.reviewNote}
            </blockquote>
          )}
        </>
      }
      action={
        <SplitButton to="/join" size="lg">
          Apply again
        </SplitButton>
      }
    />
  )
}

function Panel({
  icon,
  title,
  body,
  action,
  accent,
}: {
  icon: React.ReactNode
  title: string
  body: React.ReactNode
  action: React.ReactNode
  accent?: boolean
}) {
  return (
    <FadeUp>
      <section
        aria-labelledby="guest-status-heading"
        className="ring-border/70 relative overflow-hidden rounded-4xl p-8 ring-1 sm:p-12"
        style={{ background: 'var(--bits-surface)' }}
      >
        {accent && (
          <div
            aria-hidden="true"
            className="brand-gradient pointer-events-none absolute -top-32 -right-24 size-80 rounded-full opacity-25 blur-3xl"
          />
        )}
        <div className="relative max-w-2xl">
          <span className="text-brand-sky [&_svg]:size-7" aria-hidden="true">
            {icon}
          </span>
          <h2
            id="guest-status-heading"
            className="mt-6 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
          >
            {title}
          </h2>
          <div className="text-muted-foreground mt-4 text-lg leading-relaxed">{body}</div>
          <div className="mt-8">{action}</div>
        </div>
      </section>
    </FadeUp>
  )
}
