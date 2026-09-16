import { Link } from '@tanstack/react-router'
import { ArrowUpRight, FolderGit2 } from 'lucide-react'
import type { HomeData } from '#/services/home'
import { FadeUp } from '#/components/motion'

/** Approved member projects, three across, from the previous site. */
export function FeaturedProjects({
  projects,
}: {
  projects: HomeData['featuredProjects']
}) {
  return (
    <section
      className="mx-auto max-w-6xl px-(--gutter) py-24 sm:py-28"
      aria-labelledby="projects-heading"
    >
      <FadeUp className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-xl">
          <h2
            id="projects-heading"
            className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
          >
            Featured projects
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            Built by members, reviewed by officers, shipped to the showcase.
          </p>
        </div>
        <Link
          to="/projects"
          className="text-foreground/80 hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
        >
          All projects
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </FadeUp>

      {projects.length === 0 ? (
        <FadeUp className="border-border text-muted-foreground mt-10 rounded-2xl border border-dashed px-6 py-14 text-center text-sm">
          No approved projects yet. Members submit theirs from the dashboard.
        </FadeUp>
      ) : (
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {projects.map((p, i) => (
            <FadeUp key={p.id} delay={i * 0.08}>
              <Link
                to="/projects"
                className="group bg-card text-card-foreground border-border flex h-full flex-col overflow-hidden rounded-2xl border transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
              >
                <div className="bg-brand-navy relative aspect-[16/10] overflow-hidden">
                  {p.imageKeys[0] ? (
                    <img
                      src={`/files/${p.imageKeys[0]}`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_20%,#5fb2ee_0%,transparent_60%),radial-gradient(60%_70%_at_85%_90%,#1f4f8a_0%,transparent_65%)]">
                      <FolderGit2
                        className="absolute right-5 bottom-5 size-8 text-white/70"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
                    {p.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 line-clamp-3 text-sm leading-relaxed">
                    {p.description}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
                    {p.tech.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 font-mono text-[11px]"
                      >
                        {t}
                      </span>
                    ))}
                    <span className="text-muted-foreground ml-auto text-xs">
                      {p.authorName}
                    </span>
                  </div>
                </div>
              </Link>
            </FadeUp>
          ))}
        </ul>
      )}
    </section>
  )
}
