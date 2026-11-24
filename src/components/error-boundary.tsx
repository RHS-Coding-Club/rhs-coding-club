import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { RaisedButton } from '#/components/raised-button'
import { RotateCw } from '#/components/icons/rotate-cw'

/**
 * What a route shows when its loader or render throws: what happened, the
 * error itself in small mono (useful when someone screenshots it to an
 * officer), and two ways forward.
 */
export function ErrorBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const [retrying, setRetrying] = useState(false)
  const message = error instanceof Error ? error.message : String(error)

  async function retry() {
    setRetrying(true)
    try {
      await router.invalidate({ sync: true })
    } finally {
      setRetrying(false)
    }
  }

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-start px-(--gutter) py-24 sm:py-32">
      <h1 className="text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
        This page didn't load
      </h1>
      <p className="text-muted-foreground mt-4 max-w-prose text-lg text-pretty">
        Try again in a moment. If it keeps happening, send an officer the message below
        and what you clicked.
      </p>
      {message && (
        <p className="bg-muted text-muted-foreground mt-6 w-full rounded-xl px-4 py-3 font-mono text-sm break-words">
          {message}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <RaisedButton onClick={retry} loading={retrying}>
          <RotateCw aria-hidden="true" />
          Try again
        </RaisedButton>
        <RaisedButton asChild variant="ghost">
          <Link to="/">Go to the home page</Link>
        </RaisedButton>
      </div>
    </section>
  )
}
