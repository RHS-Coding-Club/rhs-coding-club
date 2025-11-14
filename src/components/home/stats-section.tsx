'use client';

import { Container } from '@/components/container';
import { Skeleton } from '@/components/ui/skeleton';
import { useHomepageData } from '@/hooks/useHomepageData';

export function StatsSection() {
  const { stats, loading } = useHomepageData();

  return (
    <section id="stats-section" className="py-20 bg-muted/30">
      <Container>
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Community</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join a thriving community of passionate developers and innovators
          </p>
        </div>

        <div className="animate-fade-in animation-delay-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2 hover:scale-105 transition-transform duration-300">
              {loading ? (
                <Skeleton className="h-16 w-24 mx-auto mb-2" />
              ) : (
                <div className="text-5xl md:text-6xl font-bold text-primary">
                  {stats.memberCount}+
                </div>
              )}
              <div className="text-muted-foreground text-lg">Active Members</div>
            </div>
            <div className="space-y-2 hover:scale-105 transition-transform duration-300">
              {loading ? (
                <Skeleton className="h-16 w-24 mx-auto mb-2" />
              ) : (
                <div className="text-5xl md:text-6xl font-bold text-primary">
                  {stats.eventCount}
                </div>
              )}
              <div className="text-muted-foreground text-lg">Events This Semester</div>
            </div>
            <div className="space-y-2 hover:scale-105 transition-transform duration-300">
              {loading ? (
                <Skeleton className="h-16 w-24 mx-auto mb-2" />
              ) : (
                <div className="text-5xl md:text-6xl font-bold text-primary">
                  {stats.projectCount}
                </div>
              )}
              <div className="text-muted-foreground text-lg">Projects Submitted</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}