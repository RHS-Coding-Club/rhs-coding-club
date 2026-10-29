import type { CSSProperties } from 'react'
import { useRouter } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import {
  Calendar03Icon,
  ChartLineData02Icon,
  CheckmarkCircle02Icon,
  GithubIcon,
  UserGroupIcon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import MagicBento from '#/components/bits/MagicBento'
import type { MagicBentoItem } from '#/components/bits/MagicBento'
import { FadeUp } from '#/components/motion'
import { useIsDark } from '#/hooks/use-is-dark'
import type { Theme } from '#/server/theme'

type Cell = MagicBentoItem & { to: LinkProps['to'] }

const icon = (svg: IconSvgElement) => (
  <HugeiconsIcon icon={svg} size={14} strokeWidth={1.9} />
)

const CELLS: Cell[] = [
  {
    label: 'Leaderboard',
    icon: icon(ChartLineData02Icon),
    title: 'Points that add up',
    description: 'Every solve, project, and meeting goes on the ledger.',
    visual: 'analytics',
    to: '/leaderboard',
  },
  {
    label: 'Challenges',
    icon: icon(ZapIcon),
    title: 'A problem every week',
    description: 'Easy to hard, in any language you like.',
    visual: 'dashboard',
    to: '/challenges',
  },
  {
    label: 'Projects',
    icon: icon(UserGroupIcon),
    title: 'Build with a team',
    description:
      'Pair up for the hackathon or a semester project. Approved work goes to the public showcase with your name on it.',
    visual: 'collaboration',
    colSpan: 2,
    rowSpan: 2,
    to: '/projects',
  },
  {
    label: 'Reviews',
    icon: icon(CheckmarkCircle02Icon),
    title: 'Submit, get reviewed, earn',
    description:
      'Drop a link to your solution. An officer reviews it, points land on the board, and badges unlock on their own.',
    visual: 'automation',
    colSpan: 2,
    rowSpan: 2,
    to: '/challenges',
  },
  {
    label: 'GitHub',
    icon: icon(GithubIcon),
    title: 'A seat in the org',
    description: 'Shared repos, code review, real history.',
    visual: 'integration',
    to: '/about',
  },
  {
    label: 'Events',
    icon: icon(Calendar03Icon),
    title: 'RSVP in one tap',
    description: 'Meetings, service days, the hackathon.',
    visual: 'security',
    to: '/events',
  },
]

/** Magic Bento's surfaces mapped onto the site tokens. */
const BENTO_VARS = {
  '--mb-surface': 'var(--bits-surface)',
  '--mb-edge': 'var(--bits-edge)',
  '--mb-highlight': 'var(--bits-highlight)',
  '--mb-tile': 'var(--bits-tile)',
} as CSSProperties

/**
 * React Bits Magic Bento: six things a member gets, each with live artwork
 * (points chart, weekly solves, a shared doc, the review pipeline, the tool
 * hub, event toggles). Edge light follows the cursor; a click sends a wave
 * across the grid and opens the page behind the card.
 */
export function FeatureBento({ theme }: { theme: Theme }) {
  const router = useRouter()
  const dark = useIsDark(theme === 'dark')

  return (
    <section
      className="mx-auto max-w-6xl px-(--gutter) py-16 sm:py-24"
      aria-labelledby="features-heading"
    >
      <FadeUp className="mx-auto mb-12 max-w-2xl text-center">
        <h2
          id="features-heading"
          className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
        >
          Everything a member gets
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          One account for challenges, points, badges, events, projects, and the org.
        </p>
      </FadeUp>
      <MagicBento
        items={CELLS}
        columns={4}
        rowHeight={200}
        gap={12}
        radius={20}
        theme={dark ? 'dark' : 'light'}
        glowColor="#5fb2ee"
        spotlightRadius={300}
        enableSpotlight
        enableBorderGlow
        enableStars={false}
        particleCount={24}
        enableTilt={false}
        enableMagnetism={false}
        clickEffect
        textAutoHide
        intro
        onItemClick={(item) => {
          const to = (item as Cell).to
          // Let the click wave start before the route changes.
          window.setTimeout(() => void router.navigate({ to }), 260)
        }}
        style={BENTO_VARS}
      />
    </section>
  )
}
