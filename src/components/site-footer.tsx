import { Link } from '@tanstack/react-router'
import { Logo } from '#/components/logo'

export function SiteFooter() {
  return (
    <footer className="border-border/60 border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-(--gutter) py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Logo className="size-9" />
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold tracking-tight">
              RHS Coding Club
            </p>
            <p className="text-muted-foreground text-sm">Ripon High School</p>
          </div>
        </div>
        <nav
          className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-2 text-sm"
          aria-label="Footer"
        >
          <Link to="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <a
            href="https://www.instagram.com/rhs.codingclub/"
            className="hover:text-foreground transition-colors"
            rel="noreferrer"
            target="_blank"
          >
            Instagram
          </a>
        </nav>
      </div>
    </footer>
  )
}
