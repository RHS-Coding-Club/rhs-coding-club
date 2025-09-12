'use client';

import Link from 'next/link';
import { Code2, Github, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NewsletterForm } from './newsletter-form';
import { useAuth } from '@/components/auth';

export function Footer() {
  const { userProfile, loading } = useAuth();
  const showJoinLink = !loading && (!userProfile || userProfile.role === 'guest');
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <Code2 className="h-6 w-6" />
              <span className="text-lg font-bold">RHS Coding Club</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Empowering students to learn, create, and innovate through
              programming and technology.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://github.com/RHS-Coding-Club" target="_blank">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://x.com" target="_blank">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.6.75Zm-1.7 12.95h1.5l-7.05-11.05h-1.6l7.05 11.05Z"/>
                  </svg>
                  <span className="sr-only">X</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="mailto:contact@rhscodingclub.com">
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Email</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li>
                {showJoinLink && (
                  <Link
                    href="/join"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Join Club
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/resources"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Learning Materials
                </Link>
              </li>
              <li>
                <Link
                  href="/challenges"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Coding Challenges
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
              {!loading && userProfile && userProfile.role !== 'guest' && (
                <li>
                  <Link
                    href="/github-membership"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Join GitHub Org
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest updates and events.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            © 2025 RHS Coding Club. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
            <a
              href="https://github.com/JashanMaan28"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Built by Jashanpreet Singh
            </a>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
