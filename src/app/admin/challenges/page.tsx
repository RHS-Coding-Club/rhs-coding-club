'use client';

import { Container } from '@/components/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChallengeManagement } from '@/components/admin/challenge-management';
import { SubmissionReview } from '@/components/admin/submission-review';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useChallenges } from '@/hooks/useChallenges';

export default function AdminChallengesPage() {
  const { challenges, loading, refetch } = useChallenges();

  return (
    <ProtectedRoute requiredRoles={['admin', 'officer']}>
      <div className="py-20">
        <Container>
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">Challenge Administration</h1>
              <p className="text-lg text-muted-foreground">
                Manage coding challenges and review student submissions.
              </p>
            </div>

            <Tabs defaultValue="challenges" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="challenges">Manage Challenges</TabsTrigger>
                <TabsTrigger value="submissions">Review Submissions</TabsTrigger>
              </TabsList>

              <TabsContent value="challenges">
                {loading ? (
                  <p className="text-center">Loading challenges...</p>
                ) : (
                  <ChallengeManagement
                    challenges={challenges}
                    onChallengeUpdate={refetch}
                  />
                )}
              </TabsContent>

              <TabsContent value="submissions">
                <SubmissionReview />
              </TabsContent>
            </Tabs>
          </div>
        </Container>
      </div>
    </ProtectedRoute>
  );
}
