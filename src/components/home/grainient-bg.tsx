import { Suspense, lazy, useEffect, useState } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import type { Theme } from '#/server/theme'
import { cn } from '#/lib/utils'

// ogl and the shader only ever load in the browser.
const Grainient = lazy(() => import('#/components/bits/Grainient'))

/**
 * Hero backdrop: React Bits Grainient in the club's navy/sky palette. Renders
 * a plain CSS gradient on the server, for reduced motion, and while the
 * WebGL chunk loads, so the fold always has color.
 */
export function GrainientBackground({ initialTheme }: { initialTheme: Theme }) {
  return (
    <ClientOnly fallback={<Fallback />}>
      <Live initialTheme={initialTheme} />
    </ClientOnly>
  )
}

function Live({ initialTheme }: { initialTheme: Theme }) {
  const dark = useIsDark(initialTheme === 'dark')
  const reduced = useReducedMotion()
  if (reduced) return <Fallback />
  return (
    <Suspense fallback={<Fallback />}>
      <div aria-hidden="true" className="absolute inset-0">
        <Grainient
          color1="#1f4f8a"
          color2="#5fb2ee"
          color3={dark ? '#a9d4f5' : '#e6edf5'}
          lightMode={!dark}
          timeSpeed={0.18}
          warpStrength={1}
          warpFrequency={4}
          warpSpeed={1.4}
          warpAmplitude={60}
          blendSoftness={0.08}
          noiseScale={1.6}
          grainAmount={0.12}
          grainScale={2}
          contrast={dark ? 1.2 : 1.15}
          saturation={1.05}
          zoom={0.9}
        />
      </div>
    </Suspense>
  )
}

function Fallback({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_20%,#1f4f8a_0%,transparent_60%),radial-gradient(60%_70%_at_85%_30%,#a9d4f5_0%,transparent_60%),radial-gradient(70%_60%_at_50%_100%,#1f4f8a_0%,transparent_65%)] bg-[#5fb2ee]',
        className,
      )}
    />
  )
}

/** Tracks the <html> class so the shader recolors when the theme toggle flips. */
function useIsDark(initial: boolean) {
  const [dark, setDark] = useState(initial)
  useEffect(() => {
    const root = document.documentElement
    const read = () => setDark(root.classList.contains('dark'))
    read()
    const mo = new MutationObserver(read)
    mo.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])
  return dark
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const read = () => setReduced(mq.matches)
    read()
    mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [])
  return reduced
}
