import { createFileRoute } from '@tanstack/react-router'
import { getHome } from '#/server/public'
import { Hero } from '#/components/home/hero'
import { RevealParagraph } from '#/components/home/reveal-paragraph'
import { FeatureBento } from '#/components/home/bento'
import { Testimonials } from '#/components/home/testimonials'
import { HowItWorks } from '#/components/home/how-it-works'
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
      <Testimonials />
      <HowItWorks />
      <Faq club={data.club} points={data.points} />
    </>
  )
}
