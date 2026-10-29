import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/db'
import { getAboutData, getClubPulseData, getHomeData } from '#/services/home'

/** Public, unauthenticated reads for the marketing pages. */

export const getHome = createServerFn({ method: 'GET' }).handler(() =>
  getHomeData(getDb()),
)

export const getAbout = createServerFn({ method: 'GET' }).handler(() =>
  getAboutData(getDb()),
)

export const getClubPulse = createServerFn({ method: 'GET' }).handler(() =>
  getClubPulseData(getDb()),
)
