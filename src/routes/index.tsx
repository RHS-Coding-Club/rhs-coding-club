import { Link, createFileRoute } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <section className="brand-gradient relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <p className="eyebrow text-brand-frost/80">Most active club at RHS</p>
        <h1 className="font-display text-brand-frost mt-3 max-w-3xl text-6xl leading-[0.95] sm:text-7xl">
          Learn to code. <em className="italic">Teach</em> the next kid.
        </h1>
        <p className="text-brand-frost/85 mt-6 max-w-xl text-lg">
          Weekly challenges, community service at the Ripon Afterschool Program,
          hackathons, and a place to ship your first real project.
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
            className="border-brand-frost/40 text-brand-frost hover:bg-brand-frost/10 bg-transparent"
          >
            <Link to="/challenges">See this week's challenge</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
