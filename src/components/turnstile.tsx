import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Ref } from 'react'
import { TURNSTILE_SITE_KEY } from '#/lib/turnstile'
import type { TurnstileAction } from '#/lib/turnstile'

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string
      action: string
      theme: 'auto'
      size: 'flexible'
      appearance: 'interaction-only'
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    },
  ) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const WAIT_MS = 30_000

let loading: Promise<TurnstileApi> | undefined

function loadTurnstile(): Promise<TurnstileApi> {
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    if (window.turnstile) {
      resolve(window.turnstile)
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT
    script.async = true
    script.onload = () =>
      window.turnstile
        ? resolve(window.turnstile)
        : reject(new Error('Turnstile did not load'))
    script.onerror = () => reject(new Error('Turnstile did not load'))
    document.head.appendChild(script)
  }).catch((err: unknown) => {
    // Let the next form try again rather than remembering the failure.
    loading = undefined
    throw err
  })
  return loading
}

export type TurnstileHandle = {
  /** Loads the widget now, for a form that waits until someone starts using it. */
  start: () => void
  /** The token, waiting for the check to finish. Empty if it fails or there's no widget. */
  getToken: () => Promise<string>
  /** Tokens work once, so call this after every attempt that leaves the form on screen. */
  reset: () => void
}

/**
 * Cloudflare Turnstile. Invisible unless Cloudflare wants a click. Forms ask
 * for the token as they submit, and the server checks it. `lazy` keeps
 * Cloudflare's script off pages until the visitor touches the form, for the
 * footer form that's on every page.
 */
export function Turnstile({
  ref,
  action,
  lazy = false,
  className,
}: {
  ref: Ref<TurnstileHandle>
  action: TurnstileAction
  lazy?: boolean
  className?: string
}) {
  const container = useRef<HTMLDivElement>(null)
  const widget = useRef<{ id: string; api: TurnstileApi } | null>(null)
  const token = useRef<string | null>(null)
  const failed = useRef(false)
  const waiting = useRef<((value: string) => void)[]>([])
  const [started, setStarted] = useState(!lazy)

  const settle = (value: string) => {
    for (const resolve of waiting.current) resolve(value)
    waiting.current = []
  }

  useEffect(() => {
    const element = container.current
    if (!started || !element || !TURNSTILE_SITE_KEY) return
    const sitekey = TURNSTILE_SITE_KEY
    let cancelled = false
    loadTurnstile()
      .then((api) => {
        if (cancelled) return
        const id = api.render(element, {
          sitekey,
          action,
          theme: 'auto',
          size: 'flexible',
          appearance: 'interaction-only',
          callback: (value) => {
            token.current = value
            failed.current = false
            settle(value)
          },
          'expired-callback': () => {
            token.current = null
          },
          'error-callback': () => {
            token.current = null
            failed.current = true
            settle('')
          },
        })
        widget.current = { id, api }
      })
      .catch((err: unknown) => {
        console.error(err)
        failed.current = true
        settle('')
      })
    return () => {
      cancelled = true
      widget.current?.api.remove(widget.current.id)
      widget.current = null
      token.current = null
    }
  }, [started, action])

  useImperativeHandle(
    ref,
    () => ({
      start: () => setStarted(true),
      getToken: () => {
        if (!TURNSTILE_SITE_KEY) return Promise.resolve('')
        if (token.current) return Promise.resolve(token.current)
        setStarted(true)
        return new Promise<string>((resolve) => {
          const timer = setTimeout(() => settle(''), WAIT_MS)
          waiting.current.push((value) => {
            clearTimeout(timer)
            resolve(value)
          })
        })
      },
      reset: () => {
        token.current = null
        failed.current = false
        if (widget.current) widget.current.api.reset(widget.current.id)
      },
    }),
    [],
  )

  if (!TURNSTILE_SITE_KEY) return null
  return <div ref={container} className={className} />
}
