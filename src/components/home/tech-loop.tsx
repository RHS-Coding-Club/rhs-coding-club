import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import {
  CppIcon,
  Css3Icon,
  FigmaIcon,
  GithubIcon,
  Html5Icon,
  JavaIcon,
  JavaScriptIcon,
  PythonIcon,
  ReactIcon,
  ReplitIcon,
  TypescriptIcon,
  VisualStudioCodeIcon,
} from '@hugeicons/core-free-icons'
import LogoLoop from '#/components/bits/LogoLoop'
import type { LogoItem } from '#/components/bits/LogoLoop'

const TOOLS: [IconSvgElement, string][] = [
  [PythonIcon, 'Python'],
  [JavaScriptIcon, 'JavaScript'],
  [JavaIcon, 'Java'],
  [CppIcon, 'C++'],
  [Html5Icon, 'HTML'],
  [Css3Icon, 'CSS'],
  [TypescriptIcon, 'TypeScript'],
  [ReactIcon, 'React'],
  [GithubIcon, 'GitHub'],
  [VisualStudioCodeIcon, 'VS Code'],
  [ReplitIcon, 'Replit'],
  [FigmaIcon, 'Figma'],
]

const LOGOS: LogoItem[] = TOOLS.map(([icon, name]) => ({
  title: name,
  ariaLabel: name,
  node: (
    <span className="text-foreground/70 flex items-center gap-2.5 text-lg font-medium tracking-tight whitespace-nowrap">
      <HugeiconsIcon icon={icon} size={24} strokeWidth={1.6} />
      {name}
    </span>
  ),
}))

/**
 * React Bits Logo Loop under the hero: the languages and tools members
 * actually write in, in place of a "trusted by" strip.
 */
export function TechLoop() {
  return (
    <section aria-label="Languages and tools" className="py-14 sm:py-16">
      <p className="text-muted-foreground mb-7 text-center text-sm">
        Members write in whatever the problem needs
      </p>
      <LogoLoop
        logos={LOGOS}
        speed={40}
        gap={56}
        logoHeight={28}
        pauseOnHover
        fadeOut
        ariaLabel="Languages and tools members use"
      />
    </section>
  )
}
