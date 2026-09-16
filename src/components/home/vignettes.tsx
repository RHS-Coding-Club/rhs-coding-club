import { Link } from '@tanstack/react-router'
import { Award, Check, Flame, Github, Medal, Rocket, Star, Trophy } from 'lucide-react'
import type { ReactNode } from 'react'
import type { HomeData } from '#/services/home'
import { fmtDate, initials } from '#/lib/format'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

/*
  Small pieces of the real member UI, rendered from loader data. They appear
  inside the hero app frame and again inside the feature bento, so each one
  carries its own empty state. Shape system: pills for controls and tags,
  rounded-xl for panels inside a rounded-2xl frame.
*/

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export function ChallengeCard({
  challenge,
  detailed = false,
  className,
}: {
  challenge: HomeData['activeChallenge']
  /** Also show the prompt preview; the footer pins to the bottom of the panel. */
  detailed?: boolean
  className?: string
}) {
  return (
    <Panel className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between gap-3">
        <PanelLabel>This week</PanelLabel>
        {challenge && (
          <span className="text-muted-foreground font-mono text-xs">
            Week {challenge.weekNo}
          </span>
        )}
      </div>
      {challenge ? (
        <>
          <h3 className="font-display mt-3 text-xl leading-tight font-semibold tracking-tight">
            {challenge.title}
          </h3>
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
            {challenge.description}
          </p>
          {detailed && (
            <pre className="bg-muted/60 text-muted-foreground mt-4 line-clamp-3 rounded-lg px-3 py-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {challenge.prompt}
            </pre>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
            <Tag>{DIFFICULTY_LABEL[challenge.difficulty] ?? challenge.difficulty}</Tag>
            <Tag accent>+{challenge.points} pts</Tag>
            <Button
              asChild
              size="sm"
              className="ml-auto rounded-full transition-transform active:scale-[0.98]"
            >
              <Link to="/challenges">Submit solution</Link>
            </Button>
          </div>
        </>
      ) : (
        <EmptyLine>No challenge published yet. A new one drops every week.</EmptyLine>
      )}
    </Panel>
  )
}

export function LeaderboardList({
  rows,
  className,
}: {
  rows: HomeData['leaderboard']
  className?: string
}) {
  return (
    <Panel className={className}>
      <div className="flex items-center justify-between gap-3">
        <PanelLabel>Leaderboard</PanelLabel>
        <span className="text-muted-foreground font-mono text-xs">This semester</span>
      </div>
      {rows.length === 0 ? (
        <EmptyLine>
          No points on the ledger yet. The first solve takes first place.
        </EmptyLine>
      ) : (
        <ol className="mt-3 flex flex-col">
          {rows.map((row, i) => (
            <li
              key={row.userId}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-2',
                i === 0 && 'bg-primary/10',
              )}
            >
              <span className="text-muted-foreground w-4 text-center font-mono text-xs">
                {i + 1}
              </span>
              <Avatar className="size-7">
                <AvatarImage src={row.image ?? undefined} alt="" />
                <AvatarFallback className="text-[10px]">
                  {initials(row.name)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {row.name}
              </span>
              <span className="tabular font-mono text-sm">{row.points}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}

const BADGE_ICONS = [Trophy, Flame, Star, Medal, Rocket, Award]

export function BadgeShelf({
  badges,
  className,
}: {
  badges: HomeData['badges']
  className?: string
}) {
  return (
    <Panel className={cn('@container', className)}>
      <PanelLabel>Badges</PanelLabel>
      {badges.length === 0 ? (
        <EmptyLine>Badges show up here as the engine awards them.</EmptyLine>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-2 @xl:grid-cols-4">
          {badges.map((badge, i) => {
            const Icon = BADGE_ICONS[i % BADGE_ICONS.length]
            const rare = badge.rarity !== 'common'
            return (
              <li
                key={badge.id}
                className="border-border flex items-center gap-2.5 rounded-lg border px-2.5 py-2"
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full',
                    rare
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground',
                  )}
                >
                  <Icon className="size-4" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{badge.name}</span>
                  <span className="text-muted-foreground block font-mono text-[11px] capitalize">
                    {badge.rarity}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

export function EventRsvpRow({
  event,
  className,
}: {
  event: HomeData['nextEvent']
  className?: string
}) {
  return (
    <Panel className={className}>
      <PanelLabel>Next event</PanelLabel>
      {event ? (
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="border-border flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border leading-none">
            <span className="text-muted-foreground font-mono text-[10px] uppercase">
              {fmtDate(event.startsAt, 'short').split(' ')[0]}
            </span>
            <span className="font-display mt-1 text-2xl font-semibold">
              {fmtDate(event.startsAt, 'short').split(' ')[1]}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold">{event.title}</h3>
            <p className="text-muted-foreground mt-0.5 truncate text-sm">
              {fmtDate(event.startsAt, 'weekday')} at {fmtDate(event.startsAt, 'time')}
              {event.location ? `, ${event.location}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-mono text-xs">
              {event.going} going
            </span>
            <div
              className="border-border flex rounded-full border p-0.5 text-xs font-medium"
              role="group"
              aria-label="RSVP"
            >
              <Button
                asChild
                size="sm"
                className="h-7 rounded-full px-3 text-xs transition-transform active:scale-[0.98]"
              >
                <Link to="/events">Going</Link>
              </Button>
              <Link
                to="/events"
                className="text-muted-foreground hover:text-foreground flex h-7 items-center rounded-full px-3 transition-colors"
              >
                Maybe
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <EmptyLine>
          Nothing scheduled yet. Events land here as officers post them.
        </EmptyLine>
      )}
    </Panel>
  )
}

export function ProjectTiles({
  projects,
  className,
}: {
  projects: HomeData['featuredProjects']
  className?: string
}) {
  return (
    <Panel className={className}>
      <div className="flex items-center justify-between gap-3">
        <PanelLabel>Showcase</PanelLabel>
        <Link
          to="/projects"
          className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
        >
          All projects
        </Link>
      </div>
      {projects.length === 0 ? (
        <EmptyLine>
          No approved projects yet. Members submit theirs from the dashboard.
        </EmptyLine>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {projects.slice(0, 3).map((p) => (
            <li
              key={p.id}
              className="border-border flex items-center gap-3 rounded-lg border px-3 py-2.5"
            >
              <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-full">
                <Check className="size-3.5" strokeWidth={2.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{p.title}</span>
                <span className="text-muted-foreground block truncate text-xs">
                  {p.authorName}
                  {p.tech.length > 0 ? ` in ${p.tech.slice(0, 2).join(', ')}` : ''}
                </span>
              </span>
              <span className="text-muted-foreground hidden font-mono text-[11px] sm:block">
                Approved
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

const ORG_STEPS = ['Request sent', 'Officer approves', 'Invite emailed', 'Joined the org']

export function GithubOrgRow({
  social,
  className,
}: {
  social: HomeData['social']
  className?: string
}) {
  const org = social.github
    .replace(/^https?:\/\/(www\.)?github\.com\//, '')
    .replace(/\/$/, '')
  return (
    <Panel className={className}>
      <div className="flex items-center gap-3">
        <span className="bg-foreground text-background flex size-9 shrink-0 items-center justify-center rounded-full">
          <Github className="size-4.5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">
            {org || 'RHS-Coding-Club'}
          </span>
          <span className="text-muted-foreground block font-mono text-xs">
            github.com
          </span>
        </span>
      </div>
      <ol className="border-border mt-4 ml-4 flex flex-col gap-2 border-l pl-4 text-sm">
        {ORG_STEPS.map((step, i) => (
          <li key={step} className="flex items-center gap-3">
            <span className="text-muted-foreground w-3 font-mono text-xs">{i + 1}</span>
            <span className={cn(i === 0 ? 'font-medium' : 'text-muted-foreground')}>
              {step}
            </span>
          </li>
        ))}
      </ol>
      <Button
        asChild
        size="sm"
        variant="outline"
        className="mt-4 w-full rounded-full transition-transform active:scale-[0.98]"
      >
        <Link to="/signup">Request access</Link>
      </Button>
    </Panel>
  )
}

/* ---------- primitives ---------- */

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('border-border bg-background rounded-xl border p-4', className)}>
      {children}
    </div>
  )
}

function PanelLabel({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium">{children}</p>
}

function Tag({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-2.5 font-mono text-xs',
        accent
          ? 'bg-primary/10 text-primary'
          : 'border-border text-muted-foreground border',
      )}
    >
      {children}
    </span>
  )
}

function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{children}</p>
}
