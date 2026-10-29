import { ClientOnly } from '@tanstack/react-router'
import StrokeText from '#/components/bits/StrokeText'
import { useIsDark } from '#/hooks/use-is-dark'

const WORD = 'Say hello'

/**
 * The /contact headline: React Bits Stroke Text. The outlines draw
 * themselves in sky blue, then the letters flood with ink from the left;
 * hovering redraws them. The SVG scales to the column width, and the
 * fallback holds the same box so nothing shifts when it mounts. The
 * screen-reader heading lives in the page hero, so this one is hidden.
 */
export function ContactTitle({ initialDark }: { initialDark: boolean }) {
  const dark = useIsDark(initialDark)
  return (
    <div aria-hidden="true" className="w-full max-w-3xl select-none">
      <ClientOnly
        fallback={
          <p className="text-[clamp(4rem,14vw,9.5rem)] leading-[1.1] font-bold tracking-[-0.045em] opacity-0">
            {WORD}
          </p>
        }
      >
        <StrokeText
          text={WORD}
          strokeColor={dark ? '#5fb2ee' : '#2a7fc4'}
          fillColor={dark ? '#ffffff' : '#101826'}
          strokeWidth={2}
          fontSize={160}
          fontWeight={700}
          letterSpacing={-7}
          drawDuration={1.5}
          fillDelay={0.15}
          stagger={0.06}
          fillMode="wipe"
          wipeFrom="left"
          hoverRedraw
          // The SVG pads its box for the stroke; pull it back to the copy edge.
          className="[&_svg]:mx-0 [&_svg]:-ml-[2.2%]"
        />
      </ClientOnly>
    </div>
  )
}
