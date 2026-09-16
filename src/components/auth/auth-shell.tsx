export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_minmax(0,420px)] lg:py-24">
      <div className="max-w-md">
        <p className="eyebrow">RHS Coding Club</p>
        <h1 className="font-display mt-3 text-5xl">{title}</h1>
        <p className="text-muted-foreground mt-4">{subtitle}</p>
      </div>
      <div className="bg-card border-border flex flex-col gap-5 rounded-lg border p-6">
        {children}
      </div>
    </section>
  )
}
