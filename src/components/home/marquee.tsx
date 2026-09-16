import {
  Atom,
  Braces,
  FileCode2,
  GitBranch,
  Github,
  Layout,
  Terminal,
  Wind,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const STACK: { name: string; icon: LucideIcon }[] = [
  { name: 'Python', icon: Terminal },
  { name: 'JavaScript', icon: Braces },
  { name: 'TypeScript', icon: FileCode2 },
  { name: 'React', icon: Atom },
  { name: 'Git', icon: GitBranch },
  { name: 'GitHub', icon: Github },
  { name: 'HTML/CSS', icon: Layout },
  { name: 'Tailwind', icon: Wind },
]

/**
 * The template's logo marquee, recast as the tools members actually use.
 * Pure CSS keyframes; the second copy is decorative so screen readers hear
 * the list once. Reduced motion stops the scroll (see styles.css).
 */
export function TechMarquee() {
  return (
    <div className="absolute inset-x-0 bottom-0 pb-8">
      <div className="from-background/90 pointer-events-none absolute inset-x-0 -top-16 bottom-0 bg-gradient-to-t to-transparent" />
      <div
        className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
        aria-label="Languages and tools we use"
      >
        <ul className="animate-marquee flex w-max items-center">
          <Row />
          <Row hidden />
        </ul>
      </div>
    </div>
  )
}

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <>
      {STACK.map(({ name, icon: Icon }) => (
        <li
          key={`${name}-${hidden ? 'copy' : 'main'}`}
          aria-hidden={hidden || undefined}
          className="text-foreground/80 flex shrink-0 items-center gap-2.5 px-8 text-xl font-semibold tracking-tight sm:px-12"
        >
          <Icon className="size-6 opacity-80" aria-hidden="true" />
          {name}
        </li>
      ))}
    </>
  )
}
