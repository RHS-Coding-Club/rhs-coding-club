import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'

export function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-4 py-24 sm:px-6">
      <p className="eyebrow">404</p>
      <h1 className="font-display text-5xl">Nothing here.</h1>
      <p className="text-muted-foreground">
        That page doesn't exist or was moved. Try the home page.
      </p>
      <Button asChild>
        <Link to="/">Back home</Link>
      </Button>
    </section>
  )
}
