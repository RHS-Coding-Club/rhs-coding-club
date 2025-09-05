'use client';

import { Container } from '@/components/container';
import { Skeleton } from '@/components/ui/skeleton';

interface PageLoadingProps {
  type?: 'grid' | 'list' | 'detail' | 'dashboard';
  itemCount?: number;
}

export function PageLoading({ type = 'grid', itemCount = 6 }: PageLoadingProps) {
  
  const renderGridSkeleton = () => (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="space-y-3 sm:space-y-4">
          <Skeleton className="h-32 sm:h-48 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderListSkeleton = () => (
    <div className="space-y-3 sm:space-y-4">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
          <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderDetailSkeleton = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <Skeleton className="h-8 sm:h-12 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 sm:h-24 w-full" />
      </div>
      
      {/* Content */}
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-48 sm:h-64 w-full rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );

  const renderDashboardSkeleton = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 sm:p-6 border rounded-lg space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        ))}
      </div>
      
      {/* Charts/Content */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Skeleton className="h-64 sm:h-80 rounded-lg" />
        <Skeleton className="h-64 sm:h-80 rounded-lg" />
      </div>
    </div>
  );

  const skeletonComponents = {
    grid: renderGridSkeleton,
    list: renderListSkeleton,
    detail: renderDetailSkeleton,
    dashboard: renderDashboardSkeleton,
  };

  return (
    <Container className="py-6 sm:py-8">
      <div className="animate-fade-in">
        {/* Page Title Skeleton */}
        <div className="mb-6 sm:mb-8 text-center">
          <Skeleton className="h-8 sm:h-12 w-1/2 mx-auto mb-3 sm:mb-4" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
        
        {/* Content Skeleton */}
        {skeletonComponents[type]()}
      </div>
    </Container>
  );
}

// Specific loading components
export function ChallengesLoading() {
  return <PageLoading type="grid" itemCount={6} />;
}

export function ProjectsLoading() {
  return <PageLoading type="grid" itemCount={9} />;
}

export function EventsLoading() {
  return <PageLoading type="list" itemCount={5} />;
}

export function BlogLoading() {
  return <PageLoading type="grid" itemCount={6} />;
}

export function DashboardLoading() {
  return <PageLoading type="dashboard" />;
}
