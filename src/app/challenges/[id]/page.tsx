'use client';

import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Trophy, Calendar, Code } from 'lucide-react';
import { SubmissionForm } from '@/components/challenges';
import { useChallenge, useSubmissions } from '@/hooks/useChallenges';
import { useAuth } from '@/contexts/auth-context';

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useAuth();
  const challengeId = params.id as string;
  
  const { challenge, loading: challengeLoading } = useChallenge(challengeId);
  const { submissions, refetch: refetchSubmissions } = useSubmissions(
    challengeId, 
    userProfile?.uid
  );

  const userSubmission = submissions[0] || null;

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'hard':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const handleSubmissionSuccess = () => {
    refetchSubmissions();
  };

  if (challengeLoading) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <p className="text-center">Loading challenge...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-2xl font-bold">Challenge Not Found</h1>
            <p className="text-muted-foreground">The challenge you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={() => router.push('/challenges')}>
              Back to Challenges
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/challenges')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Challenges
            </Button>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                      <Badge variant={getDifficultyVariant(challenge.difficulty)}>
                        {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{challenge.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Week {challenge.weekNo}
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    {challenge.points} points
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Problem Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">{challenge.prompt}</div>
                  </div>

                  {(challenge.sampleInput || challenge.sampleOutput) && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h4 className="font-semibold">Sample Input/Output</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {challenge.sampleInput && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Input:</label>
                              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                                {challenge.sampleInput}
                              </pre>
                            </div>
                          )}
                          {challenge.sampleOutput && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Output:</label>
                              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                                {challenge.sampleOutput}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {userProfile ? (
              <SubmissionForm
                challenge={challenge}
                existingSubmission={userSubmission}
                onSubmissionSuccess={handleSubmissionSuccess}
              />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center space-y-4">
                    <Code className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">Sign in to Submit</h3>
                      <p className="text-muted-foreground">
                        You need to be signed in to submit your solution.
                      </p>
                    </div>
                    <Button onClick={() => router.push('/join')}>
                      Sign In
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
