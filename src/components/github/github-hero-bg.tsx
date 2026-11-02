import { lazy } from 'react'
import { useIsDark } from '#/hooks/use-is-dark'
import { CopilotMascot } from './copilot-mascot'

// WebGL2 and the glyph atlas only load in the browser (PageHero renders the
// background client-only, inside Suspense).
const GradientASCII = lazy(() => import('#/components/bits/GradientASCII'))

/**
 * /github hero: React Bits Gradient ASCII in its "eclipse" shape, a ring of
 * code glyphs (the org's avatar, in a way) sitting to the right of the copy.
 * Binary-only characters keep it reading as a repo, not the home hero.
 * Light mode switches the shader to ink-on-paper. The Copilot mark sits in
 * the dark middle of the ring and watches the cursor.
 */
export function GithubHeroBackground({ initialDark }: { initialDark: boolean }) {
  const dark = useIsDark(initialDark)
  return (
    // The ring sits in the right half on wide screens, clear of the title.
    <div className="absolute top-[38%] -right-[45%] -bottom-[20%] w-full opacity-80 [mask-image:radial-gradient(closest-side,black_60%,transparent)] md:inset-y-0 md:right-0 md:w-[62%] md:opacity-100">
      <GradientASCII
        colors={
          dark
            ? ['#1e3fd8', '#5fb2ee', '#a5d8ff', '#e6edf5']
            : ['#1f4f8a', '#2a7fc4', '#5fb2ee', '#9ccbf2']
        }
        lightMode={!dark}
        shape="eclipse"
        characters="01{}<>/;"
        cellSize={14}
        density={0.75}
        glyphOpacity={0.8}
        glow={0.2}
        flicker={0.15}
        softness={0.55}
        flow={0.4}
        speed={0.6}
        gradientOpacity={0.7}
        grain={0.05}
        scrambleRadius={0.12}
        clickEffect="burst"
        fontFamily="'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace"
      />
      <CopilotMascot className="absolute top-1/2 left-1/2 w-[clamp(4.5rem,9vw,8.5rem)] -translate-x-1/2 -translate-y-1/2 text-[#101826] dark:text-white" />
    </div>
  )
}
