'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { 
  Github, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Mail,
  User,
  Shield 
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GitHubMembershipRequest } from '@/lib/firebase-collections';
import { toast } from 'sonner';

type RequestStatus = 'pending' | 'approved' | 'denied' | 'invite-sent' | 'already-member' | 'already-invited' | 'joined';

interface StatusInfo {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
}

const STATUS_INFO: Record<RequestStatus, StatusInfo> = {
  pending: {
    title: 'Pending Review',
    description: 'Your request is waiting for admin review',
    icon: Clock,
    color: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50',
  },
  approved: {
    title: 'Approved',
    description: 'Your request has been approved. Invitation will be sent soon.',
    icon: CheckCircle,
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50',
  },
  'invite-sent': {
    title: 'Invitation Sent',
    description: 'GitHub invitation has been sent! Check your email or GitHub notifications.',
    icon: Mail,
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50',
  },
  'already-member': {
    title: 'Already a Member',
    description: 'You are already a member of our GitHub organization.',
    icon: Shield,
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50',
  },
  'already-invited': {
    title: 'Already Invited',
    description: 'You already have a pending invitation. Check your GitHub notifications.',
    icon: Mail,
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50',
  },
  denied: {
    title: 'Request Denied',
    description: 'Your request was denied. Contact an admin for more information.',
    icon: XCircle,
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/50',
  },
  joined: {
    title: 'Joined 🎉',
    description: 'You are an active member of the GitHub organization. Happy collaborating!',
    icon: CheckCircle,
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50',
  },
};

export default function GitHubMembershipPage() {
  const { user, userProfile } = useAuth();
  const [githubUsername, setGithubUsername] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<GitHubMembershipRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userProfile) {
      // Check for existing requests
      const q = query(
        collection(db, 'githubMembershipRequests'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setCurrentRequest({ 
            id: doc.id, 
            ...doc.data() 
          } as GitHubMembershipRequest);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, userProfile]);

  // Poll GitHub API when waiting for user to accept invite to transition to joined
  useEffect(() => {
    if (!currentRequest) return;
    // Only poll if these statuses that could transition to joined
    if (!['invite-sent', 'already-invited', 'approved'].includes(currentRequest.status)) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/github/check-membership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ githubUsername: currentRequest.githubUsername })
        });
        const data = await res.json();
        if (!cancelled && data.success && data.status === 'joined') {
          // Update Firestore status to joined
          const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
          await updateDoc(doc(db, 'githubMembershipRequests', currentRequest.id), {
            status: 'joined',
            updatedAt: serverTimestamp(),
          });
          // Stop polling
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error polling membership status', err);
      }
    }, 15000); // every 15s

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [currentRequest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!githubUsername.trim()) {
      toast.error('GitHub username is required');
      return;
    }

    if (!user || !userProfile) {
      toast.error('You must be signed in to submit a request');
      return;
    }

    setIsSubmitting(true);

    try {
      // First, check if user already has a request
      const existingRequestQuery = query(
        collection(db, 'githubMembershipRequests'),
        where('userId', '==', user.uid),
        where('status', 'in', ['pending', 'approved', 'invite-sent'])
      );

      const existingSnapshot = await getDocs(existingRequestQuery);
      
      if (!existingSnapshot.empty) {
        toast.error('You already have an active membership request');
        return;
      }

      // Call API to validate GitHub user and check status
      const response = await fetch('/api/github/membership-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUsername: githubUsername.trim(),
          note: note.trim(),
          userId: user.uid,
          userEmail: userProfile.email,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Failed to submit request');
        return;
      }

      // Save to Firestore
      await addDoc(collection(db, 'githubMembershipRequests'), {
        ...result.requestData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success(result.message);
      setGithubUsername('');
      setNote('');

    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['member', 'officer', 'admin']}>
        <div className="py-20">
          <Container>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </div>
          </Container>
        </div>
      </ProtectedRoute>
    );
  }

  const canSubmitNewRequest = !currentRequest || 
    currentRequest.status === 'denied';

  return (
    <ProtectedRoute requiredRoles={['member', 'officer', 'admin']}>
      <div className="py-20">
        <Container>
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto">
                <Github className="h-8 w-8 text-gray-700 dark:text-gray-300" />
              </div>
              <h1 className="text-3xl font-bold">Join Our GitHub Organization</h1>
              <p className="text-lg text-muted-foreground">
                Request membership to collaborate on our projects and access exclusive repositories.
              </p>
            </div>

            {/* Current Request Status */}
            {currentRequest && (
              <Card className={`${STATUS_INFO[currentRequest.status].bgColor}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {React.createElement(STATUS_INFO[currentRequest.status].icon, {
                      className: `h-5 w-5 ${STATUS_INFO[currentRequest.status].color}`
                    })}
                    {STATUS_INFO[currentRequest.status].title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {STATUS_INFO[currentRequest.status].description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="font-medium">GitHub Username:</Label>
                      <p className="text-muted-foreground">{currentRequest.githubUsername}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Request Date:</Label>
                      <p className="text-muted-foreground">
                        {(() => {
                          const ts = currentRequest.createdAt as unknown;
                          if (
                            ts &&
                            typeof ts === 'object' &&
                            'seconds' in (ts as Record<string, unknown>) &&
                            typeof (ts as { seconds?: unknown }).seconds === 'number'
                          ) {
                            return new Date((ts as { seconds: number }).seconds * 1000).toLocaleDateString();
                          }
                          if (
                            ts &&
                            typeof ts === 'object' &&
                            'toDate' in (ts as Record<string, unknown>) &&
                            typeof (ts as { toDate?: unknown }).toDate === 'function'
                          ) {
                            return (ts as { toDate: () => Date }).toDate().toLocaleDateString();
                          }
                          return 'N/A';
                        })()}
                      </p>
                    </div>
                  </div>

                  {currentRequest.note && (
                    <div>
                      <Label className="font-medium">Your Note:</Label>
                      <p className="text-sm text-muted-foreground mt-1">{currentRequest.note}</p>
                    </div>
                  )}

                  {currentRequest.adminNotes && (
                    <div>
                      <Label className="font-medium">Admin Notes:</Label>
                      <p className="text-sm text-muted-foreground mt-1">{currentRequest.adminNotes}</p>
                    </div>
                  )}

                  {currentRequest.inviteError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 dark:bg-red-900/20 dark:border-red-800/50">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-red-800 dark:text-red-300 text-sm">Invitation Error:</p>
                          <p className="text-red-700 dark:text-red-400 text-sm mt-1">{currentRequest.inviteError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Badge variant="outline" className="text-xs border-current">
                    Status: {currentRequest.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Request Form */}
            {canSubmitNewRequest && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Request GitHub Organization Membership
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (from your account)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userProfile?.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="githubUsername">
                        GitHub Username <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="githubUsername"
                        placeholder="Enter your GitHub username"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        We&apos;ll verify this username exists on GitHub
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="note">Note (optional)</Label>
                      <Textarea
                        id="note"
                        placeholder={"Any additional information you\u2019d like to share..."}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <Github className="h-4 w-4 mr-2" />
                          Submit Membership Request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Information */}
            <Card>
              <CardHeader>
                <CardTitle>What happens next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-1">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Request Review</h4>
                      <p className="text-sm text-muted-foreground">
                        Our admins will review your request and verify your GitHub account
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-1">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Invitation Sent</h4>
                      <p className="text-sm text-muted-foreground">
                        If approved, you&apos;ll receive a GitHub organization invitation via email
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-1">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Accept & Collaborate</h4>
                      <p className="text-sm text-muted-foreground">
                        Accept the invitation and start collaborating on our projects!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    </ProtectedRoute>
  );
}