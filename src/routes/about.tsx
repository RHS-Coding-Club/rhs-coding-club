import { Link, createFileRoute } from '@tanstack/react-router'
import { CalendarDays } from '#/components/icons/calendar-days'
import { MapPin } from '#/components/icons/map-pin'
import CountUp from '#/components/bits/CountUp'
import { OfficerCredits } from '#/components/about/officer-credits'
import { WavesBackground } from '#/components/about/waves-bg'
import { YearRail } from '#/components/about/year-rail'
import { FadeUp } from '#/components/motion'
import { PageHero } from '#/components/page-hero'
import { RaisedButton } from '#/components/raised-button'
import { SplitButton } from '#/components/split-button'
import { getAbout } from '#/server/public'

const DESCRIPTION =
  'Who runs RHS Coding Club, when and where we meet, and how the year runs: weekly challenges, teaching at RAP, and the H2O hackathon.'

export const Route = createFileRoute('/about')({
  loader: () => getAbout(),
  head: () => ({
    meta: [
      { title: 'About · RHS Coding Club' },
      { name: 'description', content: DESCRIPTION },
      { property: 'og:title', content: 'About RHS Coding Club' },
      { property: 'og:description', content: DESCRIPTION },
    ],
  }),
  component: AboutPage,
})

/**
 * People first: the mission is the headline over React Bits Waves, then the
 * live numbers as one sentence, the year as a swipeable rail, the officers
 * as credits, and an invitation to a meeting.
 */
function AboutPage() {
  const { club, social, stats, officers } = Route.useLoaderData()
  const { theme } = Route.useRouteContext()
  const [lead, rest] = splitFirstSentence(club.missionStatement)

  return (
    <>
      <PageHero
        size="lg"
        background={<WavesBackground initialDark={theme === 'dark'} />}
        eyebrow="About the club"
        title={lead}
        description={rest || club.description}
        actions={
          <>
            <SplitButton to="/signup" size="lg">
              Join the club
            </SplitButton>
            <RaisedButton asChild variant="ghost" size="lg">
              <a href="#people">Meet the officers</a>
            </RaisedButton>
          </>
        }
        aside={
          <dl className="bg-card/80 ring-border/70 grid min-w-64 gap-4 rounded-3xl p-5 ring-1 backdrop-blur-md">
            <Fact icon={CalendarDays} term="We meet" value={club.meetingSchedule} />
            <Fact icon={MapPin} term="Where" value={club.meetingLocation} />
          </dl>
        }
      />

      <section className="mx-auto max-w-6xl px-(--gutter) pt-20 sm:pt-28">
        <FadeUp>
          <p className="max-w-4xl text-3xl leading-snug font-medium tracking-[-0.025em] text-balance sm:text-[2.6rem] sm:leading-[1.2]">
            Right now the club has <Num n={stats.members} /> active members, has run{' '}
            <Num n={stats.eventsThisSemester} /> events this semester, and has{' '}
            <Num n={stats.projects} /> projects in the showcase.
          </p>
          <p className="text-muted-foreground mt-5 max-w-2xl text-lg text-pretty">
            {club.description}
          </p>
        </FadeUp>
      </section>

      <YearRail />

      <OfficerCredits officers={officers} social={social} />

      <section className="mx-auto max-w-6xl px-(--gutter) pb-10">
        <FadeUp className="bg-card ring-border/70 relative overflow-hidden rounded-4xl px-6 py-14 text-center ring-1 sm:px-12 sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_0%,color-mix(in_oklab,var(--brand-sky)_16%,transparent),transparent_75%)]"
          />
          <h2 className="relative text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
            Come to a meeting
          </h2>
          <p className="text-muted-foreground relative mx-auto mt-4 max-w-md text-lg text-pretty">
            {club.meetingSchedule} in {club.meetingLocation}. No experience needed, and
            you can bring a friend.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <SplitButton to="/signup" size="lg">
              Join the club
            </SplitButton>
            <RaisedButton asChild variant="ghost" size="lg">
              <Link to="/contact">Ask an officer</Link>
            </RaisedButton>
          </div>
        </FadeUp>
      </section>
    </>
  )
}

function Num({ n }: { n: number }) {
  return (
    <span className="text-primary tabular-nums">
      <CountUp to={n} duration={1.2} trigger="view" />
    </span>
  )
}

function Fact({
  icon: Icon,
  term,
  value,
}: {
  icon: typeof MapPin
  term: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="text-brand-sky mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>
        <dt className="text-muted-foreground text-sm">{term}</dt>
        <dd className="mt-0.5 font-medium">{value}</dd>
      </div>
    </div>
  )
}

/** "We teach. Then more." -> ["We teach.", "Then more."]; one sentence stays whole. */
function splitFirstSentence(text: string): [string, string] {
  const m = text.match(/^(.+?[.!?])\s+(.*)$/s)
  return m?.[1] && m[2] ? [m[1], m[2]] : [text, '']
}
