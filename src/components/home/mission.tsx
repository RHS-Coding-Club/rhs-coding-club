import ScrollReveal from '#/components/bits/ScrollReveal'

const COPY =
  'RHS Coding Club is where Ripon High students learn to code together: a new challenge every week, points for solving it, events and a hackathon each year, and afternoons teaching kids at the Ripon Afterschool Program.'

/**
 * React Bits Scroll Reveal: the club in one sentence, each word sharpening
 * as the paragraph scrolls up the viewport. The unread words stay legible
 * (22% opacity, a light blur) so the sentence never reads as a smudge.
 */
export function Mission() {
  return (
    <section className="mx-auto max-w-4xl px-(--gutter) py-20 sm:py-28">
      <ScrollReveal
        enableBlur
        baseOpacity={0.22}
        baseRotation={0}
        blurStrength={3}
        containerClassName="my-0"
        textClassName="text-3xl! leading-snug! font-medium! tracking-[-0.02em] text-balance sm:text-4xl! lg:text-[2.75rem]! lg:leading-[1.2]!"
      >
        {COPY}
      </ScrollReveal>
    </section>
  )
}
