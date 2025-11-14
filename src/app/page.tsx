'use client';

import { Suspense, lazy } from 'react';
import { StructuredData } from '@/components/structured-data';
import { HomepageLoading } from '@/components/homepage-loading';
import { useHomepageData } from '@/hooks/useHomepageData';
import { HeroSection } from '@/components/home/hero-section';
import { StatsSection } from '@/components/home/stats-section';

// Lazy load sections below the fold
const FeaturedProjectsSection = lazy(() => import('@/components/home/featured-projects-section').then(mod => ({ default: mod.FeaturedProjectsSection })));
const FeaturedPostsSection = lazy(() => import('@/components/home/featured-posts-section').then(mod => ({ default: mod.FeaturedPostsSection })));
const RecentBadgeActivitySection = lazy(() => import('@/components/home/recent-badge-activity-section').then(mod => ({ default: mod.RecentBadgeActivitySection })));
const CTASection = lazy(() => import('@/components/home/cta-section').then(mod => ({ default: mod.CTASection })));

export default function Home() {
  const { loading, error } = useHomepageData();

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <>
        <StructuredData />
        <HomepageLoading />
      </>
    );
  }

  // Log error but don't prevent page from rendering
  if (error) {
    console.error('Homepage data error:', error);
  }

  return (
    <>
      <StructuredData />
      <div className="min-h-screen">
        <HeroSection />
        <StatsSection />

        <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
          <FeaturedProjectsSection />
        </Suspense>

        <Suspense fallback={<div className="py-24 bg-muted/30 text-center">Loading...</div>}>
          <FeaturedPostsSection />
        </Suspense>

        <Suspense fallback={<div className="py-24 bg-muted/30 text-center">Loading...</div>}>
          <RecentBadgeActivitySection />
        </Suspense>

        <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
          <CTASection />
        </Suspense>
      </div>
    </>
  );
}