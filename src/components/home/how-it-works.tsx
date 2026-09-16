import { Link } from '@tanstack/react-router'
import { Rocket, Terminal, UserPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const STEPS: { title: string; text: string; icon: LucideIcon }[] = [
  {
    title: 'Join',
    text: 'Create an account and fill out the short application. An officer approves it, usually within a few days, and you are a member.',
    icon: UserPlus,
  },
  {
    title: 'Solve',
    text: 'Each week a new challenge goes up. Solve it in any language, submit a link to your code, and earn points once it is reviewed.',
    icon: Terminal,
  },
  {
    title: 'Ship',
    text: 'Come to events and the hackathon, publish a project to the showcase and our GitHub org, and collect badges along the way.',
    icon: Rocket,
  },
]

/** Template split: heading and CTA on the left, vertical timeline on the right. */
export function HowItWorks() {
  return (
    <section
      className="mx-auto max-w-6xl px-(--gutter) py-24 sm:py-28"
      aria-labelledby="how-heading"
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2
            id="how-heading"
            className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
          >
            How it works
          </h2>
          <p className="text-muted-foreground mt-4 max-w-sm text-base leading-relaxed">
            Three steps from curious to shipping. No experience required, and every step
            comes with people who will help.
          </p>
          <Link
            to="/signup"
            className="bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-ring mt-7 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium transition-[background-color,transform] outline-none focus-visible:ring-2 active:scale-[0.98]"
          >
            Apply to join
          </Link>
        </div>

        <ol className="relative">
          <div
            aria-hidden="true"
            className="bg-border absolute top-4 bottom-4 left-5 w-px"
          />
          {STEPS.map(({ title, text, icon: Icon }, i) => (
            <li
              key={title}
              className={
                i < STEPS.length - 1 ? 'relative flex gap-6 pb-20' : 'relative flex gap-6'
              }
            >
              <span className="bg-brand-sky ring-background relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full text-[#0b0f15] ring-4">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="pt-1.5">
                <p className="text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
