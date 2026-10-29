import { ClientOnly, Link } from '@tanstack/react-router'
import FuzzyText from '#/components/bits/FuzzyText'
import { RaisedButton } from '#/components/raised-button'

/** 404: React Bits Fuzzy Text, which shivers harder under the cursor. */
export function NotFound() {
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
            color="#5fb2ee"
            baseIntensity={0.18}
            hoverIntensity={0.5}
            enableHover
          >
            404
          </FuzzyText>
        </ClientOnly>
      </div>
      <p className="text-2xl font-semibold tracking-tight">This page does not exist.</p>
      <p className="text-muted-foreground -mt-3 max-w-md">
        It was moved, renamed, or never shipped. The home page is a safe bet.
      </p>
      <RaisedButton asChild size="lg">
        <Link to="/">Back home</Link>
      </RaisedButton>
    </section>
  )
}
