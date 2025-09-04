'use client';

import { useState } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Code, Award } from 'lucide-react';
import Link from 'next/link';
import { ChallengeCard, ChallengeFilters, Leaderboard } from '@/components/challenges';
import { useChallenges, useSubmissions, useLeaderboard } from '@/hooks/useChallenges';
import { useAuth } from '@/contexts/auth-context';
import { Submission } from '@/lib/firebase-collections';

export default function ChallengesPage() {
  const { challenges, loading: challengesLoading } = useChallenges();
  const { userProfile } = useAuth();
  const { submissions: userSubmissions } = useSubmissions(undefined, userProfile?.uid);
  const { leaderboard } = useLeaderboard(10);

  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Create a map of challenge ID to user submission
  const submissionMap = userSubmissions.reduce((acc, submission) => {
    acc[submission.challengeId] = submission;
    return acc;
  }, {} as Record<string, Submission>);

  // Filter challenges based on selected filters
  const filteredChallenges = challenges.filter((challenge) => {
    if (selectedDifficulty !== 'all' && challenge.difficulty !== selectedDifficulty) {
      return false;
    }

    if (selectedStatus !== 'all') {
      const userSubmission = submissionMap[challenge.id];
      
      switch (selectedStatus) {
        case 'not-attempted':
          return !userSubmission;
        case 'pending':
          return userSubmission?.status === 'pending';
        case 'pass':
          return userSubmission?.status === 'pass';
        case 'fail':
          return userSubmission?.status === 'fail';
        default:
          return true;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setSelectedDifficulty('all');
    setSelectedStatus('all');
  };

  const getStats = () => {
    const totalChallenges = challenges.length;
    const completedChallenges = userSubmissions.filter(s => s.status === 'pass').length;
    const totalPoints = userSubmissions
      .filter(s => s.status === 'pass')
      .reduce((acc, s) => acc + s.points, 0);

    return { totalChallenges, completedChallenges, totalPoints };
  };

  const stats = getStats();

  if (challengesLoading) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">Coding Challenges</h1>
              <p className="text-lg text-muted-foreground">Loading challenges...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Coding Challenges</h1>
            <p className="text-lg text-muted-foreground">
              Test your programming skills with our weekly coding challenges.
            </p>
          </div>

          {userProfile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Code className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{stats.completedChallenges}</p>
                      <p className="text-sm text-muted-foreground">Challenges Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalPoints}</p>
                      <p className="text-sm text-muted-foreground">Total Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {stats.totalChallenges > 0 
                          ? Math.round((stats.completedChallenges / stats.totalChallenges) * 100)
                          : 0}%
                      </p>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="challenges" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="challenges" className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <ChallengeFilters
                  selectedDifficulty={selectedDifficulty}
                  selectedStatus={selectedStatus}
                  onDifficultyChange={setSelectedDifficulty}
                  onStatusChange={setSelectedStatus}
                  onClearFilters={clearFilters}
                />
                
                {(userProfile?.role === 'admin' || userProfile?.role === 'officer') && (
                  <Link href="/admin/challenges">
                    <Button>Manage Challenges</Button>
                  </Link>
                )}
              </div>

              <div className="grid gap-6">
                {filteredChallenges.length === 0 ? (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-muted-foreground">
                        No challenges found matching your filters.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      userSubmission={submissionMap[challenge.id]}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="leaderboard">
              <Leaderboard 
                users={leaderboard} 
                currentUserId={userProfile?.uid}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </div>
  );
}
