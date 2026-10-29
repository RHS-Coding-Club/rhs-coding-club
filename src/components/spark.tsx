import { createContext, useCallback, useContext, useRef } from 'react'
import ClickSpark from '#/components/bits/ClickSpark'
import type { ClickSparkHandle } from '#/components/bits/ClickSpark'

const SparkContext = createContext<((el: Element | null) => void) | null>(null)

/**
 * One React Bits Click Spark for the whole site, at the root so a burst
 * outlives the page change or re-render the click causes. It bursts on
 * clicks on anything marked `data-spark` ("Join the club", RSVP "Going"),
 * and `useSpark()` fires it from code (a check-in going through).
 */
export function SparkRoot({ children }: { children: React.ReactNode }) {
  const ref = useRef<ClickSparkHandle>(null)
  const burst = useCallback((el: Element | null) => {
    if (!el) return ref.current?.spark()
    const r = el.getBoundingClientRect()
    ref.current?.spark(r.left + r.width / 2, r.top + r.height / 2)
  }, [])
  return (
    <SparkContext.Provider value={burst}>
      <ClickSpark
        ref={ref}
        only="[data-spark]"
        fixedLayer
        sparkColor={['#5fb2ee', '#9ccbf2', '#1f4f8a']}
        sparkCount={12}
        sparkRadius={42}
        sparkSize={12}
        duration={520}
        shape="line"
      >
        {children}
      </ClickSpark>
    </SparkContext.Provider>
  )
}

/** Bursts the root spark from the middle of an element (or the screen). */
export function useSpark() {
  return useContext(SparkContext) ?? (() => {})
}
