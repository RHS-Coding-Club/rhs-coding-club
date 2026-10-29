import DecryptedText from '#/components/bits/DecryptedText'

/** Temporary stand-in for pages that land in later phases. Delete when the real page ships. */
export function PlaceholderPage({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <section className="mx-auto max-w-6xl px-(--gutter) py-16 sm:py-24">
      <p className="text-muted-foreground text-sm">{eyebrow}</p>
      <h1 className="mt-3 text-[clamp(2.75rem,7vw,5.5rem)] leading-none font-semibold tracking-[-0.045em]">
        <DecryptedText
          text={title}
          animateOn="view"
          sequential
          revealDirection="start"
          speed={45}
          encryptedClassName="text-brand-sky"
        />
      </h1>
      <p className="text-muted-foreground mt-6 max-w-prose text-lg">
        This page is being rebuilt. It will be back shortly with the rest of the new site.
      </p>
    </section>
  )
}
