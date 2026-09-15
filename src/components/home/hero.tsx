import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { HomeData } from '#/services/home'
import { fmtDate } from '#/lib/format'
import { Button } from '#/components/ui/button'
import DecryptedText from '#/components/bits/DecryptedText'
import SplitText from '#/components/bits/SplitText'
import Noise from '#/components/bits/Noise'
import { HeroBackground } from './backgrounds'
import type { Look } from './backgrounds'

export function Hero({
  look,
  club,
  nextEvent,
}: {
  look: Look
  club: HomeData['club']
  nextEvent: HomeData['nextEvent']
}) {
  return (
    <section className="dark relative isolate min-h-[88dvh] overflow-hidden bg-[#0b0f15] text-[#e8eef6]">
      <HeroBackground look={look} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-screen">
        <Noise patternSize={200} patternAlpha={18} patternRefreshInterval={4} />
      </div>

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[88dvh] max-w-7xl flex-col justify-end px-5 pt-24 pb-10 sm:px-8 lg:px-10">
        <div className="max-w-4xl">
          <p className="font-mono text-xs tracking-[0.18em] text-[#9ccbf2] uppercase">
            {look === 'water' ? (
              <DecryptedText
                text={club.tagline}
                animateOn="view"
                sequential
                speed={45}
                characters="01"
                encryptedClassName="text-[#5fb2ee]/60"
              />
            ) : (
              club.tagline
            )}
          </p>
          <SplitText
            tag="h1"
            text="Learn to code. Teach the next kid."
            textAlign="left"
            splitType="words"
            delay={70}
            duration={0.9}
            from={{ opacity: 0, y: 28 }}
            to={{ opacity: 1, y: 0 }}
            className="font-display mt-5 text-5xl leading-[0.95] font-bold tracking-tight [font-stretch:90%] sm:text-6xl lg:text-8xl"
          />
          <p className="mt-6 max-w-xl text-lg text-[#b3c0cf] sm:text-xl">
            {club.description}
          </p>
          <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-[#e6edf5] px-6 text-base text-[#0b0f15] hover:bg-white active:scale-[0.98]"
            >
              <Link to="/signup">Join the club</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-[#e6edf5]/30 bg-[#0b0f15]/30 px-6 text-base text-[#e6edf5] backdrop-blur hover:bg-[#e6edf5]/10 hover:text-white active:scale-[0.98]"
            >
              <Link to="/challenges">This week's challenge</Link>
            </Button>
          </div>
        </div>

        {nextEvent && (
          <Link
            to="/events"
            className="pointer-events-auto mt-14 flex w-full max-w-2xl items-center gap-4 border-t border-[#e6edf5]/20 pt-4 text-sm text-[#e6edf5]/90 transition-colors hover:text-white"
          >
            <span className="font-mono text-xs text-[#9ccbf2]">Next</span>
            <span className="font-display text-lg font-semibold">{nextEvent.title}</span>
            <span className="text-[#b3c0cf]">
              {fmtDate(nextEvent.startsAt, 'datetime')}
            </span>
            <ArrowUpRight className="ml-auto size-4 shrink-0" />
          </Link>
        )}
      </div>
    </section>
  )
}
