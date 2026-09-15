/** Temporary stand-in for pages that land in later phases. Delete when the real page ships. */
export function PlaceholderPage({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="font-display mt-2 text-5xl">{title}</h1>
      <p className="text-muted-foreground mt-4 max-w-prose">
        This page is being rebuilt. It will be back shortly with the rest of the new site.
      </p>
    </section>
  )
}
