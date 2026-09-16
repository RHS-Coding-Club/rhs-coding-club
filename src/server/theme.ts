import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { z } from 'zod'

export const THEMES = ['dark', 'light'] as const
export type Theme = (typeof THEMES)[number]
const COOKIE = 'theme'
const themeSchema = z.enum(THEMES)

/** Dark is the club's default; the cookie only exists when a visitor chose. */
export const getTheme = createServerFn({ method: 'GET' }).handler((): Theme => {
  const parsed = themeSchema.safeParse(getCookie(COOKIE))
  return parsed.success ? parsed.data : 'dark'
})

export const setTheme = createServerFn({ method: 'POST' })
  .inputValidator(themeSchema)
  .handler(({ data }) => {
    setCookie(COOKIE, data, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      httpOnly: false,
    })
    return data
  })
