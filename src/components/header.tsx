'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Code2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthButton } from '@/components/auth/auth-button';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Events', href: '/events' },
  { name: 'Projects', href: '/projects' },
  { name: 'Resources', href: '/resources' },
  { name: 'Challenges', href: '/challenges' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Code2 className="h-6 w-6" />
              </motion.div>
              <span className="text-xl font-bold">RHS Coding Club</span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-8">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            <AuthButton />
            <ThemeToggle />
            <div className="hidden md:flex items-center space-x-2">
              <Button asChild size="sm">
                <Link href="/join">Join Club</Link>
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden>
                <div className="flex flex-col h-full">
                  <div className="flex flex-col space-y-6 mt-12 px-2">
                    {navigation.map(item => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-lg font-medium transition-colors hover:text-primary py-3 px-4 rounded-lg hover:bg-accent/50 border-b border-border/20 last:border-b-0"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-auto mb-8 px-2">
                    <Button asChild className="w-full h-12 text-base">
                      <Link href="/join">Join Club</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
