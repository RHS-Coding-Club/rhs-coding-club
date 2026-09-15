import { Link, createFileRoute } from '@tanstack/react-router'
import { getHome } from '#/server/public'
import { Button } from '#/components/ui/button'
import { HeroCanvas } from '#/components/hero-canvas'
import {
  FeaturedProjects,
  LatestPosts,
  NextEventBanner,
  RecentAwards,
  SectionHeader,
  StatsStrip,
} from '#/components/home/sections'

export const Route = createFileRoute('/')({
  loader: () => getHome(),
  component: Home,
})

function Home() {
  const data = Route.useLoaderData()

  return (
    <>
      <section className="brand-gradient relative overflow-hidden">
        <HeroCanvas />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-24 pb-10 sm:px-6 sm:pt-32">
          <div>
            <p className="eyebrow text-brand-frost/80">{data.club.tagline}</p>
            <h1 className="font-display text-brand-frost mt-3 max-w-3xl text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">
              Learn to code. <em className="italic">Teach</em> the next kid.
            </h1>
            <p className="text-brand-frost/85 mt-6 max-w-xl text-lg">
              {data.club.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-brand-frost text-brand-navy hover:bg-white"
              >
                <Link to="/signup">Join the club</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-brand-frost/40 text-brand-frost hover:bg-brand-frost/10 bg-transparent hover:text-white"
              >
                <Link to="/challenges">This week's challenge</Link>
              </Button>
            </div>
          </div>
          <NextEventBanner event={data.nextEvent} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <StatsStrip stats={data.stats} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionHeader
          eyebrow="Projects"
          title="Built by members"
          to="/projects"
          cta="All projects"
        />
        <FeaturedProjects projects={data.featuredProjects} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionHeader
          eyebrow="Blog"
          title="Latest from the club"
          to="/blog"
          cta="All posts"
        />
        <LatestPosts posts={data.latestPosts} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionHeader
          eyebrow="Badges"
          title="Recently earned"
          to="/hall-of-fame"
          cta="Hall of fame"
        />
        <RecentAwards awards={data.recentAwards} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-6 pb-20 sm:px-6">
        <div className="border-border flex flex-wrap items-center justify-between gap-6 rounded-lg border px-6 py-8 sm:px-10">
          <div>
            <p className="eyebrow">Open to all RHS students</p>
            <p className="font-display mt-1 text-3xl sm:text-4xl">
              Meets {data.club.meetingSchedule.toLowerCase()} in{' '}
              {data.club.meetingLocation}.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/join">How to join</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
