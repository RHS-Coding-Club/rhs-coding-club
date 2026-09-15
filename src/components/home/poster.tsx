import { Suspense, lazy } from 'react'
import { ClientOnly, Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import type { HomeData } from '#/services/home'
import { fmtDate } from '#/lib/format'
import { Logo } from '#/components/logo'

// Grainient is WebGL (ogl) and only ever mounts in the browser. The server
// renders the CSS gradient underneath, which also stays on for visitors who
// prefer reduced motion.
const Grainient = lazy(() => import('#/components/bits/Grainient'))

/**
 * The hero visual: the club's next event laid out like one of its Instagram
 * posters (navy-to-sky gradient, white type, logo disc in the corner). The
 * poster is always dark, in both site themes, because that is the brand.
 */
export function Poster({
  club,
  nextEvent,
}: {
  club: HomeData['club']
  nextEvent: HomeData['nextEvent']
}) {
  return (
    <div className="relative isolate aspect-[4/5] overflow-hidden rounded-2xl bg-[#0b0f15] text-[#f4f8fc] sm:aspect-[5/6] lg:aspect-auto lg:h-full">
      <PosterGradient />
      {/* Scrim keeps the small type legible where the gradient turns sky. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#0b0f15]/75 via-[#0b0f15]/15 to-transparent"
      />

      <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <Logo className="size-10" />
          <span className="text-sm text-white/85">
            {nextEvent ? 'Next up' : club.tagline}
          </span>
        </div>

        {nextEvent ? (
          <div>
            <p className="font-display text-[clamp(4.5rem,11vw,8rem)] leading-[0.88] font-bold tracking-[-0.04em] lg:text-[clamp(4.5rem,6.5vw,6.5rem)]">
              {fmtDate(nextEvent.startsAt, 'short')}
            </p>
            <p className="mt-4 text-lg text-white/90 sm:text-xl">
              {fmtDate(nextEvent.startsAt, 'weekday')} at{' '}
              {fmtDate(nextEvent.startsAt, 'time')}
            </p>
            <h2 className="font-display mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">
              {nextEvent.title}
            </h2>
            {nextEvent.location && (
              <p className="mt-2 text-base text-white/80 sm:text-lg">
                {nextEvent.location}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="font-display text-[clamp(3rem,8vw,5.5rem)] leading-[0.92] font-bold tracking-[-0.04em]">
              {club.meetingSchedule}
            </p>
            <h2 className="font-display mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              {club.meetingLocation}
            </h2>
            <p className="mt-3 max-w-xs text-white/80">{club.missionStatement}</p>
          </div>
        )}

        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-white/90 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          All events
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}

function PosterGradient() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="poster-fallback" />
      <ClientOnly fallback={null}>
        <Shader />
      </ClientOnly>
    </div>
  )
}

function Shader() {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <Suspense fallback={null}>
      <div className="animate-in fade-in absolute inset-0 duration-1000">
        <Grainient
          color1="#5fb2ee"
          color2="#1f4f8a"
          color3="#0b0f15"
          timeSpeed={0.18}
          colorBalance={0.05}
          warpStrength={1}
          warpFrequency={3}
          warpSpeed={1.2}
          warpAmplitude={36}
          blendAngle={-35}
          blendSoftness={0.25}
          rotationAmount={220}
          noiseScale={1.6}
          grainAmount={0.09}
          grainScale={2.5}
          contrast={1.15}
          saturation={1.05}
          centerX={-0.12}
          centerY={0.08}
          zoom={0.85}
        />
      </div>
    </Suspense>
  )
}
