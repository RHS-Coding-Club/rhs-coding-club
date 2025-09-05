'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/container';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <Container className="flex min-h-[calc(100vh-200px)] items-center justify-center">
      <div className="text-center space-y-6 max-w-lg mx-auto px-4">
        {/* Error icon */}
        <div className="flex justify-center">
          <div className="relative">
            <AlertTriangle className="w-20 h-20 text-destructive" />
            <div className="absolute inset-0 w-20 h-20 text-destructive/20 blur-sm">
              <AlertTriangle className="w-20 h-20" />
            </div>
          </div>
        </div>

        {/* Error message */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Something went wrong!
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            We encountered an unexpected error. Our team has been notified and is working to fix this issue.
          </p>
          {process.env.NODE_ENV === 'development' && error.message && (
            <details className="mt-4 p-4 bg-muted rounded-lg text-left">
              <summary className="cursor-pointer font-medium text-sm">
                Error Details (Development Mode)
              </summary>
              <pre className="mt-2 text-xs text-muted-foreground overflow-auto">
                {error.message}
              </pre>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </details>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button onClick={reset} size="lg" className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button variant="outline" asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Contact support */}
        <div className="pt-6 border-t">
          <p className="text-sm text-muted-foreground mb-3">
            If this problem persists, please contact us
          </p>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
