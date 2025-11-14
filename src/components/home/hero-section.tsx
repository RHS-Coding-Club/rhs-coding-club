'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Container } from '@/components/container';
import { NextEventBanner } from '@/components/next-event-banner';
import { useAuth } from '@/components/auth';
import { useClubSettings } from '@/contexts/club-settings-context';

export function HeroSection() {
  const { userProfile, loading: authLoading } = useAuth();
  const { settings: clubSettings } = useClubSettings();
  const showJoinCta = !authLoading && (!userProfile || userProfile.role === 'guest');

  return (
    <section className="h-screen flex items-center justify-center relative overflow-hidden">
      <Container>
        <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
              <span className="gradient-text">{clubSettings?.clubName || 'RHS Coding Club'}</span>
            </h1>
            <p className="mt-6 md:mt-8 text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {clubSettings?.description || 'Empowering student developers through collaboration, innovation, and hands-on learning. Join our community and take your coding skills to the next level.'}
            </p>
          </div>

          {/* Next Event Banner */}
          <div className="animate-fade-in animation-delay-150">
            <NextEventBanner />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 md:pt-8 animate-fade-in animation-delay-200">
            {showJoinCta && (
              <Button size="lg" className="px-8 sm:px-10 w-full sm:w-auto min-h-[48px] text-lg" asChild>
                <Link href="/join">
                  Join the Club
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button size="lg" variant="outline" className="px-8 sm:px-10 w-full sm:w-auto min-h-[48px] text-lg" asChild>
              <Link href="/about">
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <div className="absolute bottom-24 md:bottom-20 lg:bottom-24 left-1/2 transform -translate-x-1/2 cursor-pointer group animate-fade-in animation-delay-1000"
           onClick={() => {
             const nextSection = document.querySelector('#stats-section');
             nextSection?.scrollIntoView({ behavior: 'smooth' });
           }}>
        <div className="flex flex-col items-center space-y-2 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
          <span className="text-sm">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground flex justify-center items-start pt-2 group-hover:border-foreground transition-colors duration-300">
            <div className="animate-bounce w-1 h-2 rounded-full bg-muted-foreground group-hover:bg-foreground transition-colors duration-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
}