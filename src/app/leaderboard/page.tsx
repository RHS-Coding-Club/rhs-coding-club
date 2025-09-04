'use client';

import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Leaderboard } from '@/components/challenges';
import { useLeaderboard } from '@/hooks/useChallenges';
import { useAuth } from '@/contexts/auth-context';

export default function LeaderboardPage() {
  const { userProfile } = useAuth();
  const { leaderboard: topUsers, loading: topLoading } = useLeaderboard(10);
  const { leaderboard: allUsers } = useLeaderboard(0);

  if (topLoading) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">Leaderboard</h1>
              <p className="text-lg text-muted-foreground">Loading rankings...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const currentUserRank = allUsers.findIndex(user => user.id === userProfile?.uid) + 1;
  const currentUser = allUsers.find(user => user.id === userProfile?.uid);

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Leaderboard</h1>
            <p className="text-lg text-muted-foreground">
              See how you rank against other club members.
            </p>
          </div>

          {/* Top 3 Podium */}
          {topUsers.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <Card className="mt-8">
                <CardContent className="pt-6 text-center">
                  <Medal className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <h3 className="font-semibold">{topUsers[1]?.name}</h3>
                  <p className="text-2xl font-bold">{topUsers[1]?.points || 0}</p>
                  <p className="text-sm text-muted-foreground">points</p>
                </CardContent>
              </Card>

              {/* 1st Place */}
              <Card className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-2" />
                  <h3 className="font-semibold text-lg">{topUsers[0]?.name}</h3>
                  <p className="text-3xl font-bold text-yellow-600">{topUsers[0]?.points || 0}</p>
                  <p className="text-sm text-muted-foreground">points</p>
                </CardContent>
              </Card>

              {/* 3rd Place */}
              <Card className="mt-8">
                <CardContent className="pt-6 text-center">
                  <Award className="h-12 w-12 mx-auto text-amber-600 mb-2" />
                  <h3 className="font-semibold">{topUsers[2]?.name}</h3>
                  <p className="text-2xl font-bold">{topUsers[2]?.points || 0}</p>
                  <p className="text-sm text-muted-foreground">points</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Current User Stats */}
          {userProfile && currentUser && (
            <Card className="bg-primary/5 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Your Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">#{currentUserRank || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">Rank</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{currentUser.points || 0}</p>
                    <p className="text-sm text-muted-foreground">Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {allUsers.length > 0 
                        ? Math.round(((allUsers.length - (currentUserRank - 1)) / allUsers.length) * 100)
                        : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Percentile</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="top10" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="top10">Top 10</TabsTrigger>
              <TabsTrigger value="all">All Members</TabsTrigger>
            </TabsList>

            <TabsContent value="top10">
              <Leaderboard 
                users={topUsers} 
                currentUserId={userProfile?.uid}
              />
            </TabsContent>

            <TabsContent value="all">
              <Leaderboard 
                users={allUsers} 
                currentUserId={userProfile?.uid}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </div>
  );
}
