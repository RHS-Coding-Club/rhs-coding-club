import { Container } from '@/components/container';
import { Skeleton } from '@/components/ui/skeleton';

export function HomepageLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Loading */}
      <section className="py-20 lg:py-32">
        <Container>
          <div className="text-center space-y-8">
            <div className="space-y-4 max-w-3xl mx-auto px-4">
              <Skeleton className="h-16 sm:h-20 lg:h-24 w-full max-w-3xl mx-auto" />
              <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
            </div>
            <Skeleton className="h-12 w-full max-w-xs mx-auto" />
          </div>
        </Container>
      </section>

      {/* Stats Section Loading */}
      <section className="py-16 bg-muted/30">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-12 w-full max-w-xs mx-auto" />
                <Skeleton className="h-4 w-full max-w-sm mx-auto" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Projects Loading */}
      <section className="py-20">
        <Container>
          <div className="space-y-8">
            <div className="text-center space-y-4 px-4">
              <Skeleton className="h-10 w-full max-w-md mx-auto" />
              <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-6 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-14" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Posts Loading */}
      <section className="py-20 bg-muted/30">
        <Container>
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-10 w-48 mx-auto" />
              <Skeleton className="h-6 w-80 mx-auto" />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-6 space-y-4 w-full">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-6 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section Loading */}
      <section className="py-20">
        <Container>
          <div className="text-center space-y-8 px-4">
            <Skeleton className="h-10 w-full max-w-sm mx-auto" />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
