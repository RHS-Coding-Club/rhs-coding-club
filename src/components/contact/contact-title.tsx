import { ClientOnly } from '@tanstack/react-router'
import TextPressure from '#/components/bits/TextPressure'
import { useIsDark } from '#/hooks/use-is-dark'

const WORD = 'SAY HELLO'

/**
 * The /contact headline: React Bits Text Pressure. The letters swell and
 * lean toward the cursor (and ripple on click). The box keeps the text's
 * aspect ratio, so nothing shifts when the variable font loads; the
 * screen-reader heading lives in the page hero, so this one is hidden.
 */
export function ContactTitle({ initialDark }: { initialDark: boolean }) {
  const dark = useIsDark(initialDark)
  return (
    <div aria-hidden="true" className="aspect-[4.5/1] w-full select-none">
      <ClientOnly
        fallback={
          <p className="text-[clamp(3rem,15vw,10.5rem)] leading-none font-black tracking-tight uppercase opacity-0">
            {WORD}
          </p>
        }
      >
        <TextPressure
          text={WORD}
          flex
          width
          weight
          italic={false}
          alpha={false}
          textColor="currentColor"
          pressureColor={dark ? '#5fb2ee' : '#2a7fc4'}
          radius={0.45}
          smoothing={0.4}
          idle="wave"
          idleSpeed={0.8}
          minFontSize={36}
        />
      </ClientOnly>
    </div>
  )
}
