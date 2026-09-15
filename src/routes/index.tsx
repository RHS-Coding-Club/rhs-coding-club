import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { getHome } from '#/server/public'
import { Hero } from '#/components/home/hero'
import {
  Awards,
  JoinBand,
  Projects,
  StatsBand,
  Writing,
} from '#/components/home/sections'

// `?look=water|signal` previews the two design directions. Remove once one is chosen.
const searchSchema = z.object({ look: z.enum(['water', 'signal']).default('water') })

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  loader: () => getHome(),
  component: Home,
})

function Home() {
  const data = Route.useLoaderData()
  const { look } = Route.useSearch()

  return (
    <>
      <Hero look={look} club={data.club} nextEvent={data.nextEvent} />
      <StatsBand stats={data.stats} />
      <Projects projects={data.featuredProjects} look={look} />
      <Writing posts={data.latestPosts} />
      <Awards awards={data.recentAwards} />
      <JoinBand club={data.club} />
    </>
  )
}
