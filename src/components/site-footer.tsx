import { Link } from '@tanstack/react-router'

export function SiteFooter() {
  return (
    <footer className="border-border/60 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm sm:px-6">
        <p>
          <span className="font-display text-foreground text-lg">RHS Coding Club</span>
          <span className="ml-3 font-mono text-xs">est. Ripon High School</span>
        </p>
        <nav className="flex flex-wrap gap-4" aria-label="Footer">
          <Link to="/about" className="hover:text-foreground">
            About
          </Link>
          <Link to="/contact" className="hover:text-foreground">
            Contact
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <a
            href="https://www.instagram.com/rhs.codingclub/"
            className="hover:text-foreground"
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
