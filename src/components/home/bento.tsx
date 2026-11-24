import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useRouter } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import MagicBento from '#/components/bits/MagicBento'
import type { MagicBentoItem } from '#/components/bits/MagicBento'
import { FadeUp } from '#/components/motion'
import { useIsDark } from '#/hooks/use-is-dark'
import { useCssColors } from '#/hooks/use-css-colors'
import { MAGIC_BENTO_VARS } from '#/components/bits-theme'
import { Count } from '#/components/stageshow/kit'
import {
  LeaderboardPicture,
  OrgPicture,
  ProjectsPicture,
  ReviewPicture,
  RsvpPicture,
} from '#/components/stageshow/demos/bento-demos'
import type { Theme } from '#/server/theme'
import type { HomeData } from '#/services/home'
import { cn } from '#/lib/utils'

type Shape = 'hero' | 'tall' | 'square' | 'wide'
type Layout = 4 | 2 | 1
type Cell = MagicBentoItem & { to: LinkProps['to'] }

/** Grid spans per layout. One column stacks; row spans there count 100px rows. */
const SPANS: Record<Shape, Record<Layout, [col: number, row: number]>> = {
  hero: { 4: [2, 2], 2: [2, 2], 1: [1, 4] },
  tall: { 4: [1, 2], 2: [1, 2], 1: [1, 3] },
  square: { 4: [1, 1], 2: [1, 1], 1: [1, 2] },
  wide: { 4: [2, 1], 2: [2, 1], 1: [1, 3] },
}
const ROW_HEIGHT: Record<Layout, number> = { 4: 232, 2: 240, 1: 100 }

/**
 * One tile: run-in copy at the top-left (a bold lead and its gray continuation
 * at one size), then the picture. Wide tiles in the 4- and 2-column grids put
 * the picture in the right half instead, so it gets the tile's full height.
 */
function Tile({
  lead,
  rest,
  shape,
  layout,
  picture,
}: {
  lead: string
  rest: string
  shape: Shape
  layout: Layout
  picture: ReactNode
}) {
  const side = shape === 'wide' && layout !== 1
  return (
    <div className={cn('relative flex h-full flex-col', side && 'flex-row')}>
      <p
        className={cn(
          'relative z-10 m-0 px-6 pt-6 text-[17px] leading-6 tracking-[-0.012em] text-pretty text-muted-foreground',
          shape === 'hero' ? 'max-w-md' : 'max-w-sm',
          side && 'w-[44%] flex-none',
        )}
      >
        <strong className="font-semibold text-foreground">{lead}</strong> {rest}
      </p>
      <div
        className={cn(
          'relative min-h-0 flex-1',
          side ? 'self-stretch' : shape === 'hero' ? 'mt-0' : 'mt-5',
        )}
      >
        {picture}
      </div>
    </div>
  )
}

/** The one big-type tile, on the one navy ground in the grid. */
function StatTile({ points }: { points: HomeData['points'] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        window.setTimeout(() => setSeen(true), 450)
      },
      { threshold: 0.4 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className="flex h-full flex-col justify-center gap-2 bg-brand-navy px-6 text-brand-frost"
    >
      <span className="text-[17px] leading-6 text-brand-frost/75">
        Hard problems are worth
      </span>
      <span className="font-mono text-[clamp(2.75rem,5vw,3.5rem)] leading-none font-semibold tracking-[-0.04em] whitespace-nowrap tabular-nums">
        {/* The figure is real (from settings); it counts up once as the grid scrolls in. */}
        <span className="sr-only">{points.hard}</span>
        <span aria-hidden="true">
          <Count value={seen ? points.hard : 0} duration={900} />
        </span>
        <span className="ml-2 text-[0.45em] tracking-normal text-brand-frost/75">
          pts
        </span>
      </span>
      <span className="text-[15px] leading-snug text-brand-frost/75">
        Easy ones {points.easy}, medium {points.medium}. A new problem every week.
      </span>
    </div>
  )
}

/** 4 columns on a wide page, 2 on a tablet, 1 on a phone, from the section's width. */
function useLayout() {
  const ref = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<Layout>(4)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const measure = () => {
      const w = node.clientWidth
      setLayout(w >= 900 ? 4 : w >= 560 ? 2 : 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return [ref, layout] as const
}

/**
 * React Bits Magic Bento carrying Stageshow pictures of the member app: the
 * review flow as the hero, the board, an RSVP, the project showcase and the
 * GitHub org, plus one stat tile. Edge light follows the cursor; a click sends
 * a wave across the grid and opens the page behind the card.
 */
export function FeatureBento({
  theme,
  points,
}: {
  theme: Theme
  points: HomeData['points']
}) {
  const router = useRouter()
  const dark = useIsDark(theme === 'dark')
  const stageTheme = dark ? 'dark' : 'light'
  const [sky] = useCssColors('--brand-sky')
  const [gridRef, layout] = useLayout()

  const cell = (
    shape: Shape,
    title: string,
    to: LinkProps['to'],
    content: ReactNode,
  ): Cell => {
    const [colSpan, rowSpan] = SPANS[shape][layout]
    return { title, to, content, colSpan, rowSpan }
  }

  const items: Cell[] = [
    cell(
      'hero',
      'Challenges',
      '/challenges',
      <Tile
        shape="hero"
        layout={layout}
        lead="Submit, get reviewed, earn."
        rest="Paste a link to your solution. An officer reads it, and the points land when it passes."
        picture={<ReviewPicture theme={stageTheme} />}
      />,
    ),
    cell('square', 'Challenges', '/challenges', <StatTile points={points} />),
    cell(
      'tall',
      'Leaderboard',
      '/leaderboard',
      <Tile
        shape="tall"
        layout={layout}
        lead="Points that add up."
        rest="Every solve, meeting, and project goes on the ledger."
        picture={<LeaderboardPicture theme={stageTheme} />}
      />,
    ),
    cell(
      'square',
      'Events',
      '/events',
      <Tile
        shape="square"
        layout={layout}
        lead="RSVP in one tap."
        rest="Meetings, teaching days, the hackathon."
        picture={<RsvpPicture theme={stageTheme} />}
      />,
    ),
    cell(
      'wide',
      'Projects',
      '/projects',
      <Tile
        shape="wide"
        layout={layout}
        lead="Build with a team."
        rest="Approved projects go to the showcase with every teammate's name on them."
        picture={<ProjectsPicture theme={stageTheme} />}
      />,
    ),
    cell(
      'wide',
      'About the club',
      '/about',
      <Tile
        shape="wide"
        layout={layout}
        lead="A seat in the org."
        rest="Shared repos, code review, and a commit history that's yours."
        picture={<OrgPicture theme={stageTheme} />}
      />,
    ),
  ]

  return (
    <section
      className="mx-auto max-w-6xl px-(--gutter) py-16 sm:py-24"
      aria-labelledby="features-heading"
    >
      <FadeUp className="mx-auto mb-12 max-w-2xl text-center">
        <h2
          id="features-heading"
          className="text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl"
        >
          Everything a member gets
        </h2>
        <p className="mt-4 text-lg text-pretty text-muted-foreground">
          One account for challenges, points, events, projects, and the club's GitHub.
        </p>
      </FadeUp>
      <div ref={gridRef}>
        <MagicBento
          items={items}
          columns={layout}
          rowHeight={ROW_HEIGHT[layout]}
          gap={12}
          radius={20}
          theme={dark ? 'dark' : 'light'}
          glowColor={sky}
          spotlightRadius={300}
          enableSpotlight
          enableBorderGlow
          enableStars={false}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect={false}
          intro
          // Navigate on the click itself; nothing waits for decoration.
          onItemClick={(item) => void router.navigate({ to: (item as Cell).to })}
          style={{ ...MAGIC_BENTO_VARS, '--mb-pad': '0px' } as CSSProperties}
        />
      </div>
    </section>
  )
}
