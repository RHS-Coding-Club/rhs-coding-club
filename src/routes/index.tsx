import { createFileRoute } from '@tanstack/react-router'
import { getHome } from '#/server/public'
import { Hero } from '#/components/home/hero'
import { JoinBand, Pillars, Projects, Writing } from '#/components/home/sections'

export const Route = createFileRoute('/')({
  loader: () => getHome(),
  component: Home,
})

function Home() {
  const data = Route.useLoaderData()

  return (
    <>
      <Hero club={data.club} nextEvent={data.nextEvent} />
      <Pillars stats={data.stats} awards={data.recentAwards} />
      <Projects projects={data.featuredProjects} />
      <Writing posts={data.latestPosts} />
      <JoinBand club={data.club} />
    </>
  )
}
