import { Suspense, lazy } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import { useReducedMotion } from 'motion/react'
import { cn } from '#/lib/utils'

// Grainient is WebGL (ogl) and only ever mounts in the browser. The server
// renders the CSS gradient underneath, which also stays on for visitors who
// prefer reduced motion.
const Grainient = lazy(() => import('#/components/bits/Grainient'))

/**
 * The brand gradient as a backdrop: navy and sky over the near-black ground.
 * Always dark, in both site themes, so anything on top can assume white type.
 */
export function GrainientBackdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('absolute inset-0 overflow-hidden', className)}>
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
          timeSpeed={0.16}
          colorBalance={-0.05}
          warpStrength={1}
          warpFrequency={3}
          warpSpeed={1.1}
          warpAmplitude={36}
          blendAngle={-30}
          blendSoftness={0.3}
          rotationAmount={200}
          noiseScale={1.5}
          grainAmount={0.08}
          grainScale={2.5}
          contrast={1.12}
          saturation={1.05}
          centerX={0.05}
          centerY={-0.1}
          zoom={0.8}
        />
      </div>
    </Suspense>
  )
}
