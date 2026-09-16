import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import type { HomeData } from '#/services/home'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'
import CountUp from '#/components/bits/CountUp'
import { BorderBeam } from '#/components/bits/BorderBeam'
import { GrainientBackdrop } from './grainient-backdrop'
import { Reveal } from './motion'
import {
  BadgeShelf,
  ChallengeCard,
  EventRsvpRow,
  GithubOrgRow,
  LeaderboardList,
  ProjectTiles,
} from './vignettes'

function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto max-w-7xl px-(--gutter)', className)}>{children}</div>
  )
}

function Heading({
  title,
  body,
  center = false,
}: {
  title: string
  body?: string
  center?: boolean
}) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      <h2 className="font-display text-4xl leading-[1] font-bold tracking-[-0.03em] lg:text-5xl">
        {title}
      </h2>
      {body && (
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed text-pretty">
          {body}
        </p>
      )}
    </div>
  )
}

/* ---------- 1. Logo cloud of the tools members learn ---------- */

const STACK = ['Python', 'JavaScript', 'TypeScript', 'React', 'Git', 'GitHub', 'HTML/CSS']

export function StackStrip() {
  return (
    <section className="border-border border-y">
      <Container className="py-10">
        <Reveal>
          <p className="text-muted-foreground text-center text-sm">
            The tools you'll learn
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 lg:justify-between">
            {STACK.map((name) => (
              <li
                key={name}
                className="font-display text-foreground/50 text-2xl font-semibold tracking-tight select-none"
              >
                {name}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  )
}

/* ---------- 2. Feature bento with live vignettes ---------- */

export function FeatureBento({ data }: { data: HomeData }) {
  const cells: Array<{
    title: string
    body: string
    span: string
    tint?: string
    ui: ReactNode
  }> = [
    {
      title: 'Weekly challenges',
      body: 'A new problem every week, three difficulties, any language. Submit a link, an officer reviews it.',
      span: 'md:col-span-4',
      tint: 'bg-[radial-gradient(60%_60%_at_100%_0%,color-mix(in_oklab,var(--brand-sky)_14%,transparent),transparent)]',
      ui: <ChallengeCard challenge={data.activeChallenge} detailed className="h-full" />,
    },
    {
      title: 'Points and leaderboard',
      body: 'Every point is a ledger entry. The board sums them per semester.',
      span: 'md:col-span-2',
      ui: <LeaderboardList rows={data.leaderboard} />,
    },
    {
      title: 'Badges',
      body: 'Awarded automatically the moment you hit a threshold. No asking.',
      span: 'md:col-span-2',
      tint: 'bg-[linear-gradient(160deg,color-mix(in_oklab,var(--brand-navy)_30%,var(--card)),var(--card)_70%)]',
      ui: <BadgeShelf badges={data.badges} />,
    },
    {
      title: 'Events and RSVP',
      body: 'Meetings, the hackathon, and teaching days at the afterschool program. One tap to RSVP; attendance earns points.',
      span: 'md:col-span-4',
      ui: <EventRsvpRow event={data.nextEvent} />,
    },
    {
      title: 'Project showcase',
      body: 'Ship something, submit it, get it approved. It goes on the public wall with your name on it.',
      span: 'md:col-span-4',
      ui: <ProjectTiles projects={data.featuredProjects} />,
    },
    {
      title: 'GitHub org',
      body: 'Members get a seat in the club org: shared repos, reviews, and a real commit history.',
      span: 'md:col-span-2',
      tint: 'bg-muted/50',
      ui: <GithubOrgRow social={data.social} />,
    },
  ]

  return (
    <section className="py-20 lg:py-28">
      <Container>
        <Reveal>
          <Heading
            title="Everything a member gets."
            body="One account. Challenges, points, badges, events, projects, and the org, all in one place."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-6 lg:mt-16">
          {cells.map((cell, i) => (
            <Reveal key={cell.title} delay={(i % 3) * 0.06} className={cell.span}>
              <article
                className={cn(
                  'border-border bg-card flex h-full flex-col gap-6 rounded-2xl border p-6',
                  cell.tint,
                )}
              >
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight">
                    {cell.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
                    {cell.body}
                  </p>
                </div>
                <div className="mt-auto flex flex-1 flex-col justify-end">{cell.ui}</div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ---------- 3. How it works ---------- */

const STEPS = [
  {
    verb: 'Join',
    body: 'Sign up with your school email and answer a short application. An officer approves you before the next meeting.',
  },
  {
    verb: 'Solve',
    body: 'A challenge drops every week. Submit a link to your solution in any language, get it reviewed, and watch the points land.',
  },
  {
    verb: 'Ship',
    body: 'Show up to events, build for the hackathon, and publish a project to the showcase. Badges award themselves along the way.',
  },
]

export function HowItWorks() {
  return (
    <section className="border-border border-t py-20 lg:py-28">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-20">
        <Reveal>
          <Heading
            title="Join. Solve. Ship."
            body="Three steps from signup to your first approved project. The first one takes a couple of minutes."
          />
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-full px-6 text-base transition-transform active:scale-[0.98]"
          >
            <Link to="/signup">Join the club</Link>
          </Button>
        </Reveal>
        <ol>
          {STEPS.map((step, i) => (
            <li key={step.verb} className="border-border border-t">
              <Reveal
                delay={i * 0.08}
                className="grid gap-3 py-8 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8"
              >
                <h3 className="font-display text-3xl font-bold tracking-tight">
                  {step.verb}
                </h3>
                <p className="text-muted-foreground max-w-prose text-base leading-relaxed">
                  {step.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}

/* ---------- 4. Stats band ---------- */

export function StatsBand({ stats }: { stats: HomeData['stats'] }) {
  const items = [
    { n: stats.members, label: 'members' },
    { n: stats.eventsThisSemester, label: 'events this semester' },
    { n: stats.projects, label: 'projects shipped' },
  ]
  return (
    <section className="border-border border-t">
      <Container>
        <dl className="divide-border grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {items.map((item) => (
            <Reveal
              key={item.label}
              className="py-10 sm:px-8 sm:first:pl-0 sm:last:pr-0 lg:py-14"
            >
              <dd className="font-display tabular text-6xl leading-none font-bold tracking-tight lg:text-7xl">
                <CountUp to={item.n} duration={1.2} />
              </dd>
              <dt className="text-muted-foreground mt-3 text-base">{item.label}</dt>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  )
}

/* ---------- 5. Pricing ---------- */

const PLAN_FEATURES = [
  'Weekly challenges, reviewed by officers',
  'Points ledger and semester leaderboard',
  'Badges, awarded automatically',
  'Events with one-tap RSVP',
  'Project showcase with your name on it',
  'A seat in the club GitHub org',
  'Volunteer hours for teaching days',
]

export function Pricing() {
  return (
    <section className="border-border border-t py-20 lg:py-28">
      <Container>
        <Reveal>
          <Heading
            center
            title="Simple pricing."
            body="One plan. It costs exactly nothing, and it always will."
          />
        </Reveal>
        <Reveal delay={0.1} className="mx-auto mt-12 max-w-md lg:mt-16">
          <div className="border-border bg-card relative overflow-hidden rounded-2xl border p-8">
            <BorderBeam size={120} duration={9} colorFrom="#5fb2ee" colorTo="#1f4f8a" />
            <BorderBeam
              size={120}
              duration={9}
              delay={4.5}
              colorFrom="#5fb2ee"
              colorTo="#1f4f8a"
            />
            <p className="font-display text-2xl font-semibold tracking-tight">Free</p>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="font-display tabular text-6xl leading-none font-bold tracking-tight">
                $0
              </span>
              <span className="text-muted-foreground text-base">/ forever</span>
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <span className="bg-primary/10 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              asChild
              size="lg"
              className="mt-8 h-12 w-full rounded-full text-base transition-transform active:scale-[0.98]"
            >
              <Link to="/signup">Join the club</Link>
            </Button>
            <p className="text-muted-foreground mt-4 text-center text-xs">
              Must be an RHS student.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

/* ---------- 6. FAQ ---------- */

export function Faq({
  club,
  points,
}: {
  club: HomeData['club']
  points: HomeData['points']
}) {
  const items = [
    {
      q: 'Do I need experience?',
      a: 'No. Challenges come in three difficulties and the easy ones are written for first-timers. Officers review every submission with feedback, so you learn from the first one.',
    },
    {
      q: 'When and where do you meet?',
      a: `${club.meetingSchedule}, in ${club.meetingLocation}. Everything else, like hackathon days and teaching sessions, is posted on the events page with an RSVP.`,
    },
    {
      q: 'What do I need to bring?',
      a: 'A laptop if you have one, or a Chromebook. Everything we use runs in the browser or on free tools, and the resources page has setup guides.',
    },
    {
      q: 'Do I get volunteer hours?',
      a: 'Yes. Members run STEM lessons for kids at the Ripon Afterschool Program, and every teaching session counts toward your hours. Attendance is marked by an officer on the day.',
    },
    {
      q: 'How do points work?',
      a: `Every action is an entry in a ledger: ${points.easy} for an easy challenge, ${points.medium} for medium, ${points.hard} for hard, ${points.project} for an approved project, and ${points.attendance} for showing up to an event. The leaderboard sums your entries for the semester, and badges unlock at set totals.`,
    },
  ]

  return (
    <section className="border-border border-t py-20 lg:py-28">
      <Container className="max-w-3xl">
        <Reveal>
          <Heading center title="Questions, answered." />
        </Reveal>
        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="mt-10 lg:mt-14">
            {items.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger className="py-5 text-base font-medium hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground max-w-prose pb-6 text-base leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </section>
  )
}

/* ---------- 7. Final CTA on the brand gradient ---------- */

export function FinalCta() {
  return (
    <section className="pb-20 lg:pb-28">
      <Container>
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-2xl px-6 py-20 text-center text-white lg:py-28">
            <GrainientBackdrop />
            <div aria-hidden="true" className="absolute inset-0 bg-[#0b0f15]/25" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-4xl leading-[0.98] font-bold tracking-[-0.03em] lg:text-6xl">
                Your first challenge is waiting.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-lg text-white/80">
                Sign up today. Your first points are one solved challenge away.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-white px-6 text-base text-[#0b0f15] transition-transform hover:bg-white/90 active:scale-[0.98] focus-visible:ring-white/60"
                >
                  <Link to="/signup">Join the club</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="h-12 rounded-full border border-white/25 bg-white/10 px-6 text-base text-white backdrop-blur transition-transform hover:bg-white/15 hover:text-white active:scale-[0.98] focus-visible:ring-white/60"
                >
                  <Link to="/contact">Talk to an officer</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
