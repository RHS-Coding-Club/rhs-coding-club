import { lazy, Suspense } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import type { HomeData } from '#/services/home'
import { FadeUp } from '#/components/motion'
import type { MagicBentoCard } from '#/components/bits/MagicBento'
import {
  BadgeShelf,
  ChallengeVignette,
  EventVignette,
  LeaderboardVignette,
  OrgVignette,
  ProjectsVignette,
} from './vignettes'

// gsap only loads in the browser.
const MagicBento = lazy(() => import('#/components/bits/MagicBento'))

/**
 * React Bits "Magic Bento" (spotlight + border glow + magnetism, no stars, no
 * click ripple) filled with the six things a member gets. The two large
 * cells carry live UI from the loader; the small ones a one-line vignette.
 */
export function FeatureBento({ data }: { data: HomeData }) {
  const cards: MagicBentoCard[] = [
    {
      label: 'Badges',
      title: 'Earn badges',
      description: 'Awarded automatically the moment you hit a milestone.',
      content: <BadgeShelf badges={data.badges} awards={data.recentAwards} />,
    },
    {
      label: 'Events',
      title: 'RSVP in one tap',
      description: 'Meetings, service afternoons, and the hackathon.',
      content: <EventVignette event={data.nextEvent} />,
    },
    {
      label: 'Challenges',
      title: 'A challenge every week',
      description:
        'Easy to hard, in any language. Submit a link, an officer reviews it, you earn points.',
      content: <ChallengeVignette challenge={data.activeChallenge} />,
    },
    {
      label: 'Leaderboard',
      title: 'Points that add up',
      description:
        'Every solve, project, and meeting goes on the ledger. The board resets each semester.',
      content: <LeaderboardVignette rows={data.leaderboard} />,
    },
    {
      label: 'Projects',
      title: 'Ship to the showcase',
      description: 'Approved projects go public with your name on them.',
      content: <ProjectsVignette count={data.stats.projects} />,
    },
    {
      label: 'GitHub',
      title: 'A seat in the org',
      description: 'Shared repos, reviews, and a real commit history.',
      content: <OrgVignette />,
    },
  ]

  return (
    <section
      className="mx-auto max-w-6xl px-(--gutter) pb-28"
      aria-labelledby="features-heading"
    >
      <FadeUp className="mx-auto mb-12 max-w-2xl text-center">
        <h2
          id="features-heading"
          className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
        >
          Everything a member gets
        </h2>
        <p className="text-muted-foreground mt-3 text-base">
          One account. Challenges, points, badges, events, projects, and the org, all in
          one place.
        </p>
      </FadeUp>
      <FadeUp delay={0.1}>
        <ClientOnly fallback={<StaticGrid cards={cards} />}>
          <Suspense fallback={<StaticGrid cards={cards} />}>
            <MagicBento cards={cards} />
          </Suspense>
        </ClientOnly>
      </FadeUp>
    </section>
  )
}

/** Same layout without the effects: server render, loading, and no-JS. */
function StaticGrid({ cards }: { cards: MagicBentoCard[] }) {
  return (
    <div className="bento-section">
      <div className="card-responsive grid gap-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="card bg-card text-card-foreground border-border relative flex flex-col justify-between overflow-hidden rounded-[20px] border p-5"
          >
            <span className="text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase">
              {card.label}
            </span>
            {card.content && <div className="my-4 min-h-0 flex-1">{card.content}</div>}
            <div>
              <h3 className="mb-1 text-lg font-semibold tracking-tight">{card.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
