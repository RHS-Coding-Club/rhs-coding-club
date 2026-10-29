import { CheckCheck, Link2, Trophy } from 'lucide-react'
import { FadeUp } from '#/components/motion'
import { DIFFICULTY_DOT } from './meta'

const STEPS = [
  {
    icon: Link2,
    title: 'Submit a link',
    body: 'Solve it in any language, push it to GitHub, Replit, or wherever you code, and paste the link.',
  },
  {
    icon: CheckCheck,
    title: 'An officer reviews it',
    body: 'We read your code, run it against the samples, and leave a note. Not there yet? Fix it and resubmit.',
  },
  {
    icon: Trophy,
    title: 'Points hit the board',
    body: 'A pass adds the points to the leaderboard right away, and badges unlock on their own.',
  },
] as const

/** Three steps from solving to scoring, with the current point values. */
export function HowItWorks({
  points,
}: {
  points: { easy: number; medium: number; hard: number }
}) {
  return (
    <section
      aria-labelledby="how-heading"
      className="mx-auto max-w-6xl px-(--gutter) pt-16 pb-8 sm:pt-24 sm:pb-12"
    >
      <FadeUp className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2
            id="how-heading"
            className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            How it works
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-lg">
            One challenge a week, open all week. Harder problems are worth more.
          </p>
        </div>
        <dl className="flex flex-wrap gap-2" aria-label="Points per difficulty">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <div
              key={d}
              className="bg-card ring-border/70 flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-3 ring-1"
            >
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${DIFFICULTY_DOT[d]}`}
              />
              <dt className="text-muted-foreground text-sm capitalize">{d}</dt>
              <dd className="tabular font-mono text-sm font-medium">{points[d]} pts</dd>
            </div>
          ))}
        </dl>
      </FadeUp>

      <ol className="mt-10 grid gap-3 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <FadeUp
              delay={i * 0.08}
              className="ring-border/70 h-full rounded-3xl p-6 ring-1"
              style={{ background: 'var(--bits-surface)' }}
            >
              <div className="flex items-center justify-between">
                <span className="bg-brand-sky/12 text-brand-sky grid size-10 place-items-center rounded-xl">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-muted-foreground font-mono text-xs">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {step.body}
              </p>
            </FadeUp>
          </li>
        ))}
      </ol>
    </section>
  )
}
