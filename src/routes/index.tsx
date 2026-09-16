import { createFileRoute } from '@tanstack/react-router'
import { getHome } from '#/server/public'
import { Hero } from '#/components/home/hero'
import { RevealParagraph } from '#/components/home/reveal-paragraph'
import { FeatureBento } from '#/components/home/bento'
import { Community } from '#/components/home/community'
import { FeaturedProjects } from '#/components/home/featured-projects'
import { LatestPosts } from '#/components/home/latest-posts'
import { Testimonials } from '#/components/home/testimonials'
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
      <RevealParagraph />
      <FeatureBento data={data} />
      <Community stats={data.stats} awards={data.recentAwards} />
      <FeaturedProjects projects={data.featuredProjects} />
      <LatestPosts posts={data.latestPosts} />
      <Testimonials />
      <Faq club={data.club} points={data.points} />
    </>
  )
}
