/*
  Adapted from React Bits "Magic Bento" (https://www.reactbits.dev/components/magic-bento).
  Stars and the click ripple are removed (owner's choice); the global spotlight,
  border glow, and magnetism remain. Cards come from props and can carry a
  content node, and colors read the site's theme tokens instead of the
  purple defaults.
*/
import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export interface MagicBentoCard {
  label: string
  title: string
  description: string
  content?: React.ReactNode
  className?: string
}

export interface MagicBentoProps {
  cards: MagicBentoCard[]
  enableSpotlight?: boolean
  enableBorderGlow?: boolean
  enableMagnetism?: boolean
  enableTilt?: boolean
  disableAnimations?: boolean
  spotlightRadius?: number
  /** "r, g, b" */
  glowColor?: string
  className?: string
}

const DEFAULT_SPOTLIGHT_RADIUS = 300
const DEFAULT_GLOW_COLOR = '95, 178, 238'
const MOBILE_BREAKPOINT = 768

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
})

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number,
) => {
  const rect = card.getBoundingClientRect()
  const relativeX = ((mouseX - rect.left) / rect.width) * 100
  const relativeY = ((mouseY - rect.top) / rect.height) * 100
  card.style.setProperty('--glow-x', `${relativeX}%`)
  card.style.setProperty('--glow-y', `${relativeY}%`)
  card.style.setProperty('--glow-intensity', glow.toString())
  card.style.setProperty('--glow-radius', `${radius}px`)
}

const GlobalSpotlight: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>
  disableAnimations?: boolean
  enabled?: boolean
  spotlightRadius?: number
  glowColor?: string
}> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (disableAnimations || !gridRef.current || !enabled) return

    const spotlight = document.createElement('div')
    spotlight.className = 'global-spotlight'
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 40;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `
    document.body.appendChild(spotlight)
    spotlightRef.current = spotlight

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return

      const section = gridRef.current.closest('.bento-section')
      const rect = section?.getBoundingClientRect()
      const mouseInside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom

      const cards = gridRef.current.querySelectorAll<HTMLElement>('.card')

      if (!mouseInside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' })
        cards.forEach((card) => card.style.setProperty('--glow-intensity', '0'))
        return
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius)
      let minDistance = Infinity

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect()
        const centerX = cardRect.left + cardRect.width / 2
        const centerY = cardRect.top + cardRect.height / 2
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2
        const effectiveDistance = Math.max(0, distance)
        minDistance = Math.min(minDistance, effectiveDistance)

        let glowIntensity = 0
        if (effectiveDistance <= proximity) glowIntensity = 1
        else if (effectiveDistance <= fadeDistance)
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity)

        updateCardGlowProperties(
          card,
          e.clientX,
          e.clientY,
          glowIntensity,
          spotlightRadius,
        )
      })

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
      })

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: 'power2.out',
      })
    }

    const handleMouseLeave = () => {
      gridRef.current
        ?.querySelectorAll<HTMLElement>('.card')
        .forEach((card) => card.style.setProperty('--glow-intensity', '0'))
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' })
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current)
    }
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor])

  return null
}

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  return isMobile
}

const MagicBento: React.FC<MagicBentoProps> = ({
  cards,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableMagnetism = true,
  enableTilt = false,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
  className = '',
}) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobileDetection()
  const shouldDisableAnimations = disableAnimations || isMobile

  return (
    <>
      <style>
        {`
          .bento-section {
            --glow-x: 50%;
            --glow-y: 50%;
            --glow-intensity: 0;
            --glow-radius: 200px;
            --glow-color: ${glowColor};
          }

          .card-responsive {
            grid-template-columns: 1fr;
          }

          @media (min-width: 600px) {
            .card-responsive {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (min-width: 1024px) {
            .card-responsive {
              grid-template-columns: repeat(4, 1fr);
            }
            .card-responsive .card:nth-child(3) {
              grid-column: span 2;
              grid-row: span 2;
            }
            .card-responsive .card:nth-child(4) {
              grid-column: 1 / span 2;
              grid-row: 2 / span 2;
            }
            .card-responsive .card:nth-child(6) {
              grid-column: 4;
              grid-row: 3;
            }
          }

          .card--border-glow::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 6px;
            background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
                rgba(${glowColor}, calc(var(--glow-intensity) * 0.8)) 0%,
                rgba(${glowColor}, calc(var(--glow-intensity) * 0.4)) 30%,
                transparent 60%);
            border-radius: inherit;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            pointer-events: none;
            opacity: 1;
            transition: opacity 0.3s ease;
            z-index: 1;
          }

          .card--border-glow:hover {
            box-shadow: 0 4px 20px rgba(11, 15, 21, 0.25), 0 0 30px rgba(${glowColor}, 0.2);
          }
        `}
      </style>

      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <div className={`bento-section relative select-none ${className}`} ref={gridRef}>
        <div className="card-responsive grid gap-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`card bg-card text-card-foreground border-border relative flex w-full max-w-full flex-col justify-between overflow-hidden rounded-[20px] border p-5 transition-colors duration-300 ease-in-out hover:-translate-y-0.5 ${
                enableBorderGlow ? 'card--border-glow' : ''
              } ${card.className ?? ''}`}
              style={
                {
                  '--glow-x': '50%',
                  '--glow-y': '50%',
                  '--glow-intensity': '0',
                  '--glow-radius': '200px',
                } as React.CSSProperties
              }
              ref={(el) => {
                if (!el) return

                const handleMouseMove = (e: MouseEvent) => {
                  if (shouldDisableAnimations) return
                  const rect = el.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top
                  const centerX = rect.width / 2
                  const centerY = rect.height / 2

                  if (enableTilt) {
                    gsap.to(el, {
                      rotateX: ((y - centerY) / centerY) * -10,
                      rotateY: ((x - centerX) / centerX) * 10,
                      duration: 0.1,
                      ease: 'power2.out',
                      transformPerspective: 1000,
                    })
                  }
                  if (enableMagnetism) {
                    gsap.to(el, {
                      x: (x - centerX) * 0.05,
                      y: (y - centerY) * 0.05,
                      duration: 0.3,
                      ease: 'power2.out',
                    })
                  }
                }

                const handleMouseLeave = () => {
                  if (shouldDisableAnimations) return
                  if (enableTilt) {
                    gsap.to(el, {
                      rotateX: 0,
                      rotateY: 0,
                      duration: 0.3,
                      ease: 'power2.out',
                    })
                  }
                  if (enableMagnetism) {
                    gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' })
                  }
                }

                el.addEventListener('mousemove', handleMouseMove)
                el.addEventListener('mouseleave', handleMouseLeave)
                return () => {
                  el.removeEventListener('mousemove', handleMouseMove)
                  el.removeEventListener('mouseleave', handleMouseLeave)
                }
              }}
            >
              <div className="card__header relative flex justify-between gap-3">
                <span className="card__label text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase">
                  {card.label}
                </span>
              </div>
              {card.content && (
                <div className="card__body relative my-4 min-h-0 flex-1">
                  {card.content}
                </div>
              )}
              <div className="card__content relative flex flex-col">
                <h3 className="card__title m-0 mb-1 text-lg font-semibold tracking-tight">
                  {card.title}
                </h3>
                <p className="card__description text-muted-foreground text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default MagicBento
