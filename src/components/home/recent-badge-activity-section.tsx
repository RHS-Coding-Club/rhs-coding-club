'use client';

import { Container } from '@/components/container';
import { RecentBadgeActivity } from '@/components/ui/recent-badge-activity';

export function RecentBadgeActivitySection() {
  return (
    <section className="py-24 bg-muted/30">
      <Container>
        <div className="animate-fade-in max-w-3xl mx-auto">
          <RecentBadgeActivity maxItems={8} />
        </div>
      </Container>
    </section>
  );
}