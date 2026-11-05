import { ClientOnly, Link } from '@tanstack/react-router'
import FuzzyText from '#/components/bits/FuzzyText'
import { RaisedButton } from '#/components/raised-button'
import { useCssColors } from '#/hooks/use-css-colors'

/**
 * 404: React Bits Fuzzy Text, as in its demo: a big sky "404" with "not
 * found" under it in ink, both shivering harder under the cursor. The
 * canvas can't read CSS variables, so useCssColors hands it the values.
 */
export function NotFound() {
  const [primary, foreground] = useCssColors('--primary', '--foreground')
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-(--gutter) py-24 text-center">
      <h1 className="sr-only">Page not found</h1>
      <div aria-hidden="true" className="h-[clamp(7rem,22vw,12rem)]">
        <ClientOnly
          fallback={
            <span className="text-[clamp(7rem,22vw,12rem)] leading-none font-bold tracking-tighter">
              404
            </span>
          }
        >
          <FuzzyText
            fontSize="clamp(7rem, 22vw, 12rem)"
            fontWeight={800}
            color={primary}
            baseIntensity={0.18}
            hoverIntensity={0.5}
            enableHover
          >
            404
          </FuzzyText>
        </ClientOnly>
      </div>
      <div aria-hidden="true" className="-mt-4 h-[clamp(2.75rem,8vw,4.5rem)]">
        <ClientOnly
          fallback={
            <span className="text-[clamp(2.75rem,8vw,4.5rem)] leading-none font-bold tracking-tight">
              not found
            </span>
          }
        >
          <FuzzyText
            fontSize="clamp(2.75rem, 8vw, 4.5rem)"
            fontWeight={800}
            color={foreground}
            baseIntensity={0.14}
            hoverIntensity={0.45}
            enableHover
          >
            not found
          </FuzzyText>
        </ClientOnly>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">
        This page does not exist.
      </p>
      <p className="text-muted-foreground -mt-3 max-w-md">
        It was moved, renamed, or never shipped. The home page is a safe bet.
      </p>
      <RaisedButton asChild size="lg">
        <Link to="/">Back home</Link>
      </RaisedButton>
    </section>
  )
}
