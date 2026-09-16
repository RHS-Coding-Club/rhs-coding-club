import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { initials } from '#/lib/format'
import { cn } from '#/lib/utils'

// TODO(owner): replace with real quotes from members.
const TESTIMONIALS = [
  {
    quote: 'Placeholder: a member’s quote about the weekly challenges.',
    name: 'Member name',
    role: 'Class of 2027',
  },
  {
    quote: 'Placeholder: a member’s quote about teaching at the afterschool program.',
    name: 'Member name',
    role: 'Class of 2026',
  },
  {
    quote: 'Placeholder: a member’s quote about the hackathon and shipping a project.',
    name: 'Member name',
    role: 'Class of 2028',
  },
] as const

/** Template's "Trusted by" block: avatar row on the left, one quote on the right. */
export function Testimonials() {
  const [active, setActive] = useState(0)
  const current = TESTIMONIALS[active]
  const step = (dir: 1 | -1) =>
    setActive((i) => (i + dir + TESTIMONIALS.length) % TESTIMONIALS.length)

  return (
    <section
      className="bg-card text-card-foreground mx-2.5 rounded-3xl"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-6xl px-(--gutter) py-24 sm:py-28">
        <h2
          id="testimonials-heading"
          className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
        >
          What members say
        </h2>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex items-center gap-3">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={`${t.name}-${t.role}`}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                aria-label={`Show quote from ${t.name}, ${t.role}`}
                className={cn(
                  'focus-visible:ring-ring flex items-center justify-center rounded-full font-medium transition-[transform,box-shadow,background-color] outline-none focus-visible:ring-2 active:scale-[0.96]',
                  i === active
                    ? 'bg-brand-sky ring-brand-sky/40 size-16 text-base text-[#0b0f15] ring-4'
                    : 'bg-secondary text-secondary-foreground size-12 text-sm opacity-70 hover:opacity-100',
                )}
              >
                {initials(t.name)}
              </button>
            ))}
            <div className="ml-auto flex gap-2 lg:hidden">
              <NavButton onClick={() => step(-1)} label="Previous quote">
                <ChevronLeft className="size-4" />
              </NavButton>
              <NavButton onClick={() => step(1)} label="Next quote">
                <ChevronRight className="size-4" />
              </NavButton>
            </div>
          </div>

          <figure className="max-w-xl">
            <blockquote className="text-lg leading-relaxed sm:text-xl">
              <p>“{current.quote}”</p>
            </blockquote>
            <figcaption className="mt-5 flex items-center justify-between gap-4 text-sm">
              <span>
                <span className="font-medium">{current.name}</span>
                <span className="text-muted-foreground">, {current.role}</span>
              </span>
              <span className="hidden gap-2 lg:flex">
                <NavButton onClick={() => step(-1)} label="Previous quote">
                  <ChevronLeft className="size-4" />
                </NavButton>
                <NavButton onClick={() => step(1)} label="Next quote">
                  <ChevronRight className="size-4" />
                </NavButton>
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}

function NavButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="border-border/70 hover:bg-muted focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-2 active:scale-[0.96]"
    >
      {children}
    </button>
  )
}
