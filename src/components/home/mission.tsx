import ScrollReveal from '#/components/bits/ScrollReveal'

const COPY =
  'RHS Coding Club is where Ripon High students learn to code together: a new challenge every week, points for solving it, events and a hackathon each year, and afternoons teaching kids at the Ripon Afterschool Program.'

/**
 * React Bits Scroll Reveal: the club in one sentence, each word sharpening
 * out of a blur as the paragraph scrolls up the viewport.
 */
export function Mission() {
  return (
    <section className="mx-auto max-w-4xl px-(--gutter) py-20 sm:py-28">
      <ScrollReveal
        enableBlur
        baseOpacity={0.12}
        baseRotation={2}
        blurStrength={6}
        containerClassName="my-0"
        textClassName="text-3xl! leading-snug! font-medium! tracking-[-0.02em] text-balance sm:text-4xl! lg:text-[2.75rem]! lg:leading-[1.2]!"
      >
        {COPY}
      </ScrollReveal>
    </section>
  )
}
