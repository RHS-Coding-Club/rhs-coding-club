'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState, lazy, Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Container } from '@/components/container';
import { NextEventBanner } from '@/components/next-event-banner';
import { useAuth } from '@/components/auth';
import { useClubSettings } from '@/contexts/club-settings-context';
import { isCapableDevice, requestIdleCallback } from '@/lib/performance';

// Lazy load PixelBlast to avoid blocking initial render
const PixelBlast = lazy(() => import('@/components/PixelBlast'));

export function HeroSection() {
  const { userProfile, loading: authLoading } = useAuth();
  const { settings: clubSettings } = useClubSettings();
  const showJoinCta = !authLoading && (!userProfile || userProfile.role === 'guest');
  const [pixelColor, setPixelColor] = useState('#111827');
  const [shouldRenderPixelBlast, setShouldRenderPixelBlast] = useState(false);

  useEffect(() => {
    // Get the accent-foreground color from CSS variables
    const updateColor = () => {
      const accentForegroundColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-foreground')
        .trim();
      setPixelColor(accentForegroundColor || '#111827');
    };

    updateColor();
    
    // Update color when theme changes
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Only load PixelBlast on capable devices to avoid performance issues
    // Use requestIdleCallback to defer loading until browser is idle
    const idleCallback = requestIdleCallback(() => {
      setShouldRenderPixelBlast(isCapableDevice());
    }, { timeout: 200 });

    return () => {
      if (typeof idleCallback === 'number') {
        if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
          window.cancelIdleCallback(idleCallback);
        } else {
          clearTimeout(idleCallback);
        }
      }
    };
  }, []);

  return (
    <section className="h-screen flex items-center justify-center relative overflow-hidden">
      {/* PixelBlast Background Effect */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        {shouldRenderPixelBlast && (
          <Suspense fallback={null}>
            <PixelBlast
              variant="circle"
              pixelSize={8}
              color={pixelColor}
              patternScale={2.5}
              patternDensity={1.0}
              pixelSizeJitter={0.3}
              enableRipples
              rippleSpeed={0.3}
              rippleThickness={0.15}
              rippleIntensityScale={1.2}
              liquid={false}
              speed={0.3}
              edgeFade={0.25}
              transparent
              antialias={false}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
          </Suspense>
        )}
      </div>

      <Container className="relative z-10">
        <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-primary [text-shadow:0_0_12px_var(--tw-shadow-color)] shadow-primary/10">
              {clubSettings?.clubName || 'RHS Coding Club'}
            </h1>
            <p className="mt-6 md:mt-8 text-lg md:text-xl lg:text-2xl text-foreground max-w-3xl mx-auto leading-relaxed">
              <span className="bg-background box-decoration-clone px-5">
                {clubSettings?.description || 'Empowering student developers through collaboration, innovation, and hands-on learning. Join our community and take your coding skills to the next level.'}
              </span>
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
            <Button size="lg" variant="glass" className="px-8 sm:px-10 w-full sm:w-auto min-h-[48px] text-lg" asChild>
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