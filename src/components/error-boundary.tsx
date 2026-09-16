import { useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'

export function ErrorBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const message = error instanceof Error ? error.message : String(error)
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-4 py-24 sm:px-6">
      <p className="eyebrow">Something broke</p>
      <h1 className="font-display text-5xl">That didn't work.</h1>
      <p className="text-muted-foreground">{message}</p>
      <Button onClick={() => router.invalidate()}>Try again</Button>
    </section>
  )
}
