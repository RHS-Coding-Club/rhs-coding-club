import { createFileRoute } from '@tanstack/react-router'
import { getHome } from '#/server/public'
import { Hero } from '#/components/home/hero'
import {
  Faq,
  FeatureBento,
  FinalCta,
  HowItWorks,
  Pricing,
  StackStrip,
  StatsBand,
} from '#/components/home/sections'

export const Route = createFileRoute('/')({
  loader: () => getHome(),
  component: Home,
})

function Home() {
  const data = Route.useLoaderData()

  return (
    <>
      <Hero data={data} />
      <StackStrip />
      <FeatureBento data={data} />
      <HowItWorks />
      <StatsBand stats={data.stats} />
      <Pricing />
      <Faq club={data.club} points={data.points} />
      <FinalCta />
    </>
  )
}
