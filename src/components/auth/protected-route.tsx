'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRoles = ['member', 'officer', 'admin'],
  fallback,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        if (redirectTo) {
          router.push(redirectTo);
        }
        return;
      }

      if (userProfile && requiredRoles.includes(userProfile.role)) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    }
  }, [user, userProfile, loading, requiredRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You need to sign in to access this page.
              </p>
              <Button asChild>
                <Link href="/">Go to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  if (!hasAccess) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
              <p className="text-sm text-muted-foreground">
                Required roles: {requiredRoles.join(', ')}
              </p>
              <p className="text-sm text-muted-foreground">
                Your role: {userProfile?.role || 'Unknown'}
              </p>
              <Button asChild>
                <Link href="/">Go to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  return <>{children}</>;
}
