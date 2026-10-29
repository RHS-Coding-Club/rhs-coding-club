import { createFileRoute } from '@tanstack/react-router'
import { CalendarDays, Github, Instagram, MapPin } from 'lucide-react'
import BlurText from '#/components/bits/BlurText'
import SpotlightCard from '#/components/bits/SpotlightCard'
import Magnet from '#/components/bits/Magnet'
import { getAbout } from '#/server/public'
import { initials } from '#/lib/format'
import { FadeUp } from '#/components/motion'
import { RaisedButton } from '#/components/raised-button'
import { SplitButton } from '#/components/split-button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { useIsDark } from '#/hooks/use-is-dark'

export const Route = createFileRoute('/about')({
  loader: () => getAbout(),
  head: () => ({ meta: [{ title: 'About · RHS Coding Club' }] }),
  component: AboutPage,
})

function AboutPage() {
  const { club, social, officers } = Route.useLoaderData()
  const { theme } = Route.useRouteContext()
  const dark = useIsDark(theme === 'dark')

  return (
    <>
      <section className="mx-auto max-w-6xl px-(--gutter) pt-16 pb-16 sm:pt-24">
        <h1 className="max-w-4xl text-[clamp(2.75rem,6.5vw,5.5rem)] leading-[1.02] font-semibold tracking-[-0.045em]">
          <BlurText text={club.tagline} trigger="load" delay={70} stepDuration={0.4} />
        </h1>
        <FadeUp delay={0.3}>
          <p className="text-muted-foreground mt-7 max-w-2xl text-xl leading-relaxed">
            {club.description}
          </p>
          <dl className="mt-12 flex flex-wrap gap-x-14 gap-y-6">
            <Fact icon={CalendarDays} term="When we meet" value={club.meetingSchedule} />
            <Fact icon={MapPin} term="Where" value={club.meetingLocation} />
          </dl>
        </FadeUp>
      </section>

      <section className="mx-2.5">
        <div className="bg-brand-navy rounded-4xl px-(--gutter) py-20 text-[#e6edf5] sm:py-28">
          <FadeUp className="mx-auto max-w-4xl">
            <p className="text-sm text-[#e6edf5]/60">Our mission</p>
            <p className="mt-5 text-3xl leading-snug font-medium tracking-[-0.02em] text-balance sm:text-4xl sm:leading-snug">
              {club.missionStatement}
            </p>
          </FadeUp>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-(--gutter) py-20 sm:py-28"
        aria-labelledby="officers-heading"
      >
        <FadeUp className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2
            id="officers-heading"
            className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            The people running it
          </h2>
          <div className="flex gap-2">
            {social.instagram && (
              <SocialLink href={social.instagram} icon={Instagram} label="Instagram" />
            )}
            {social.github && (
              <SocialLink href={social.github} icon={Github} label="GitHub" />
            )}
          </div>
        </FadeUp>

        {officers.length === 0 ? (
          <p className="text-muted-foreground border-border rounded-3xl border border-dashed px-5 py-14 text-center text-sm">
            Officer profiles are on their way.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {officers.map((o, i) => (
              <li key={o.id}>
                <FadeUp delay={(i % 3) * 0.08} className="h-full">
                  <SpotlightCard
                    theme={dark ? 'dark' : 'light'}
                    spotlightColor="rgba(95, 178, 238, 0.9)"
                    intensity={0.18}
                    className="h-full rounded-3xl! p-6"
                    style={
                      {
                        '--spotlight-card-surface': 'var(--bits-surface)',
                        '--spotlight-card-border': 'var(--bits-edge)',
                      } as React.CSSProperties
                    }
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="size-14">
                        <AvatarImage
                          src={o.imageKey ? `/files/${o.imageKey}` : undefined}
                          alt=""
                        />
                        <AvatarFallback>{initials(o.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="truncate text-xl font-semibold tracking-tight">
                          {o.name}
                        </h3>
                        <p className="text-brand-sky text-sm font-medium">{o.title}</p>
                      </div>
                    </div>
                    {o.bio && (
                      <p className="text-muted-foreground mt-5 text-sm leading-relaxed">
                        {o.bio}
                      </p>
                    )}
                    {o.githubUrl && (
                      <a
                        href={o.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-foreground/80 hover:text-foreground mt-5 inline-flex items-center gap-1.5 font-mono text-xs transition-colors"
                      >
                        <Github className="size-3.5" aria-hidden="true" />
                        {o.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                      </a>
                    )}
                  </SpotlightCard>
                </FadeUp>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-(--gutter) pb-8">
        <FadeUp className="border-border flex flex-wrap items-center justify-between gap-8 border-t pt-14">
          <div>
            <p className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              No experience required.
            </p>
            <p className="text-muted-foreground mt-2 text-lg">
              Open to every RHS student. Bring curiosity.
            </p>
          </div>
          <Magnet padding={60} magnetStrength={3} maxOffset={14}>
            <SplitButton to="/signup" size="lg">
              Join the club
            </SplitButton>
          </Magnet>
        </FadeUp>
      </section>
    </>
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
    <div className="flex gap-3">
      <Icon className="text-brand-sky mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <dt className="text-muted-foreground text-sm">{term}</dt>
        <dd className="mt-1 text-lg font-medium">{value}</dd>
      </div>
    </div>
  )
}

function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: typeof Github
  label: string
}) {
  return (
    <RaisedButton asChild variant="outline">
      <a href={href} target="_blank" rel="noreferrer">
        <Icon aria-hidden="true" />
        {label}
      </a>
    </RaisedButton>
  )
}
