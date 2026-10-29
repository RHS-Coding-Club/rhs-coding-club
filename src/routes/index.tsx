import { createFileRoute } from '@tanstack/react-router'
import { getHome } from '#/server/public'
import { Hero } from '#/components/home/hero'
import { TechLoop } from '#/components/home/tech-loop'
import { Mission } from '#/components/home/mission'
import { FeatureBento } from '#/components/home/bento'
import { Community } from '#/components/home/community'
import { FeaturedProjects } from '#/components/home/featured-projects'
import { LatestPosts } from '#/components/home/latest-posts'
import { Faq } from '#/components/home/faq'

export const Route = createFileRoute('/')({
  loader: () => getHome(),
  component: Home,
})

function Home() {
  const data = Route.useLoaderData()
  const { theme } = Route.useRouteContext()
  return (
    <>
      <Hero theme={theme} />
      <TechLoop />
      <Mission />
      <FeatureBento theme={theme} />
      <Community stats={data.stats} awards={data.recentAwards} />
      <FeaturedProjects projects={data.featuredProjects} theme={theme} />
      <LatestPosts posts={data.latestPosts} />
      <Faq club={data.club} points={data.points} />
    </>
  )
}
