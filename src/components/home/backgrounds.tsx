import { Suspense, lazy } from 'react'
import { ClientOnly } from '@tanstack/react-router'
import { useReducedMotion } from 'motion/react'

export type Look = 'water' | 'signal'

// Both backgrounds are WebGL and several hundred KB, so they are split out and
// only ever mounted in the browser. The server renders the CSS gradient below,
// which also stays on for visitors who prefer reduced motion.
const LiquidEther = lazy(() => import('#/components/bits/LiquidEther'))
const LightRays = lazy(() => import('#/components/bits/LightRays'))

export function HeroBackground({ look }: { look: Look }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div
        className={look === 'water' ? 'hero-fallback-water' : 'hero-fallback-signal'}
      />
      <ClientOnly fallback={null}>
        <Shader look={look} />
      </ClientOnly>
    </div>
  )
}

function Shader({ look }: { look: Look }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <Suspense fallback={null}>
      <div className="animate-in fade-in absolute inset-0 duration-1000">
        {look === 'water' ? (
          <LiquidEther
            colors={['#10305a', '#1f4f8a', '#5fb2ee']}
            backgroundColor="#0b0f15"
            mouseForce={26}
            cursorSize={160}
            resolution={0.5}
            autoDemo
            autoSpeed={0.45}
            autoIntensity={1.3}
            isViscous
            viscous={40}
            iterationsViscous={24}
          />
        ) : (
          <LightRays
            raysOrigin="top-center"
            raysColor="#5fb2ee"
            raysSpeed={0.9}
            lightSpread={1.3}
            rayLength={3}
            pulsating
            saturation={1.15}
            followMouse
            mouseInfluence={0.1}
            noiseAmount={0.08}
            distortion={0.05}
          />
        )}
      </div>
    </Suspense>
  )
}
