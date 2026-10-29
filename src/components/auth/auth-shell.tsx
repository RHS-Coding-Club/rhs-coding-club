import TextType from '#/components/bits/TextType'
import { AsciiBackground } from '#/components/home/ascii-bg'

/**
 * Sign-in and sign-up frame: the hero's Gradient ASCII field on the left
 * with the title typed out (React Bits Text Type), the form card on the right.
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-(--gutter) py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:py-16">
      <div className="relative flex min-h-64 flex-col justify-end overflow-hidden rounded-4xl p-8 sm:p-10 lg:min-h-[560px]">
        <AsciiBackground />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#f3f6fb] via-[#f3f6fb]/60 to-transparent dark:from-[#120f17] dark:via-[#120f17]/50"
        />
        <div className="pointer-events-none relative">
          <h1 className="min-h-[1.1em] text-4xl font-semibold tracking-[-0.04em] text-[#101826] sm:text-5xl dark:text-white">
            <span className="sr-only">{title}</span>
            <TextType
              as="span"
              aria-hidden="true"
              text={title}
              loop={false}
              typingSpeed={55}
              initialDelay={250}
              cursorCharacter="_"
              cursorClassName="text-primary"
            />
          </h1>
          <p className="mt-4 max-w-md text-lg text-[#101826]/70 dark:text-white/75">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="bg-card ring-border/70 flex flex-col justify-center gap-5 rounded-4xl p-6 ring-1 sm:p-8">
        {children}
      </div>
    </section>
  )
}
