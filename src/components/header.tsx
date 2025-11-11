'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from '@/components/ui/resizable-navbar';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthButton } from '@/components/auth/auth-button';
import { useAuth } from '@/components/auth';
import { Logo } from '@/components/logo';

const navigation = [
  { name: 'Home', link: '/' },
  { name: 'About', link: '/about' },
  { name: 'Events', link: '/events' },
  { name: 'Projects', link: '/projects' },
  { name: 'Resources', link: '/resources' },
  { name: 'Challenges', link: '/challenges' },
  { name: 'Leaderboard', link: '/leaderboard' },
  { name: 'Blog', link: '/blog' },
  { name: 'Contact', link: '/contact' },
];

const NavbarLogo = () => {
  return (
    <Link href="/" className="relative z-20 flex items-center space-x-2 xl:space-x-2.5 px-1 xl:px-2 py-1 group">
      <motion.div
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        className="h-8 w-8 xl:h-9 xl:w-9 flex-shrink-0"
      >
        <Logo />
      </motion.div>
      <span className="text-base xl:text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200 whitespace-nowrap">
        RHS Coding Club
      </span>
    </Link>
  );
};

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userProfile, loading } = useAuth();
  const showJoinCta = !loading && (!userProfile || userProfile.role === 'guest');

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navigation} />
          <div className="flex items-center gap-1.5 xl:gap-2">
            <div className="relative z-[70]">
              <ThemeToggle />
            </div>
            <AuthButton />
            {showJoinCta && (
              <NavbarButton as={Link} href="/join" variant="primary" className="text-xs xl:text-sm px-3 xl:px-4">
                Join Club
              </NavbarButton>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <div className="flex items-center gap-2 relative z-[70]">
              <ThemeToggle />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navigation.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full relative text-foreground/80 hover:text-foreground text-base font-medium py-2 px-3 rounded-[calc(var(--radius)-0.25rem)] hover:bg-accent transition-all duration-200"
              >
                <span className="block">{item.name}</span>
              </Link>
            ))}
            <div className="flex w-full flex-col gap-2 pt-3 mt-2 border-t border-border/40">
              <AuthButton />
              {showJoinCta && (
                <NavbarButton
                  as={Link}
                  href="/join"
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  className="w-full justify-center"
                >
                  Join Club
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
