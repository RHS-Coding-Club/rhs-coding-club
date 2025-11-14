'use client';

import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

import { Container } from '@/components/container';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth';

export function CTASection() {
  const { userProfile, loading: authLoading } = useAuth();
  const showJoinCta = !authLoading && (!userProfile || userProfile.role === 'guest');

  return (
    <section className="py-24">
      <Container>
        <div className="text-center space-y-8 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our community today and take your first step toward becoming
            a skilled developer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="px-6 sm:px-8 w-full sm:w-auto min-h-[44px] min-w-[44px]" asChild>
              <Link href="/events">
                <Calendar className="mr-2 h-5 w-5" />
                View Events
              </Link>
            </Button>
            {showJoinCta && (
              <Button size="lg" variant="outline" className="px-6 sm:px-8 w-full sm:w-auto min-h-[44px] min-w-[44px]" asChild>
                <Link href="/join">
                  Join the Club
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}