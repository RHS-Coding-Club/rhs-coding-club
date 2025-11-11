'use client';

import Link from 'next/link';
import { Github, Mail, Instagram, Twitter, Linkedin, Youtube, MessageSquare, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NewsletterForm } from './newsletter-form';
import { useAuth } from '@/components/auth';
import { Logo } from '@/components/logo';
import { useClubSettings } from '@/contexts/club-settings-context';
import { useSocialMedia } from '@/contexts/social-media-context';

export function Footer() {
  const { userProfile, loading } = useAuth();
  const { settings: clubSettings } = useClubSettings();
  const { settings: socialMedia } = useSocialMedia();
  const showJoinLink = !loading && (!userProfile || userProfile.role === 'guest');

  // Define social media platforms with icons
  const socialPlatforms = [
    { key: 'github', icon: Github, label: 'GitHub', url: socialMedia?.github },
    { key: 'discord', icon: MessageSquare, label: 'Discord', url: socialMedia?.discord },
    { key: 'instagram', icon: Instagram, label: 'Instagram', url: socialMedia?.instagram },
    { key: 'twitter', icon: Twitter, label: 'Twitter', url: socialMedia?.twitter },
    { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', url: socialMedia?.linkedin },
    { key: 'youtube', icon: Youtube, label: 'YouTube', url: socialMedia?.youtube },
  ].filter(platform => platform.url); // Only show platforms with URLs

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10">
                <Logo />
              </div>
              <span className="text-lg font-bold">{clubSettings?.clubName || 'RHS Coding Club'}</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {clubSettings?.tagline || 'Empowering students to learn, create, and innovate through programming and technology.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {/* Show dynamic social links or fallback */}
              {socialPlatforms.length > 0 ? (
                socialPlatforms.map(({ key, icon: Icon, label, url }) => (
                  <Button key={key} variant="ghost" size="icon" asChild>
                    <Link href={url || '#'} target="_blank" rel="noopener noreferrer">
                      <Icon className="h-4 w-4" />
                      <span className="sr-only">{label}</span>
                    </Link>
                  </Button>
                ))
              ) : (
                <>
                  {/* Fallback icons if no social media configured */}
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="https://github.com/RHS-Coding-Club" target="_blank">
                      <Github className="h-4 w-4" />
                      <span className="sr-only">GitHub</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="https://discord.gg/UQR79bn6ZZ" target="_blank">
                      <MessageSquare className="h-4 w-4" />
                      <span className="sr-only">Discord</span>
                    </Link>
                  </Button>
                </>
              )}
              
              {/* Email button (always show) */}
              <Button variant="ghost" size="icon" asChild>
                <Link href={`mailto:${clubSettings?.contactEmail || 'contact@rhscodingclub.com'}`}>
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Email</span>
                </Link>
              </Button>
              
              {/* Custom links */}
              {socialMedia?.customLinks && socialMedia.customLinks.length > 0 && (
                socialMedia.customLinks.map((link, index) => (
                  link.url && link.name && (
                    <Button key={`custom-${index}`} variant="ghost" size="icon" asChild>
                      <Link href={link.url} target="_blank" rel="noopener noreferrer" title={link.name}>
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">{link.name}</span>
                      </Link>
                    </Button>
                  )
                ))
              )}
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
            © 2025 {clubSettings?.clubName || 'RHS Coding Club'}. All rights reserved.
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
