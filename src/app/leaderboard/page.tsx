'use client';

import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Users, 
  Target, 
  LayoutDashboard,
  Crown
} from 'lucide-react';
import { Leaderboard } from '@/components/challenges';
import { useLeaderboard } from '@/hooks/useChallenges';
import { useAuth } from '@/contexts/auth-context';
import { useState, useEffect } from 'react';
import { getPointsSettingsWithDefaults } from '@/lib/services/settings';

export default function LeaderboardPage() {
  const { userProfile } = useAuth();
  const [topLimit, setTopLimit] = useState(10);
  const { leaderboard: topUsers, loading: topLoading } = useLeaderboard(topLimit);
  const { leaderboard: allUsers } = useLeaderboard(0);
  const [activeSection, setActiveSection] = useState<string>('top10');

  // Load points settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getPointsSettingsWithDefaults();
      const limit = settings.leaderboardOptions.showTop || 10;
      setTopLimit(limit);
    } catch (error) {
      console.error('Error loading leaderboard settings:', error);
    }
  };

  if (topLoading) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-7xl mx-auto space-y-8">
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
  const totalPoints = allUsers.reduce((sum, user) => sum + (user.points || 0), 0);
  const averagePoints = allUsers.length > 0 ? Math.round(totalPoints / allUsers.length) : 0;

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Leaderboard</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how you rank against other club members.
              Compete in challenges and climb to the top of the leaderboard.
            </p>
          </div>

          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Total Members</CardTitle>
                  <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{allUsers.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Competitors</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Champion</CardTitle>
                  <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Crown className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{topUsers[0]?.points || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Top score</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Average Score</CardTitle>
                  <div className="p-2 rounded-md bg-green-500/10 text-green-600 dark:text-green-400">
                    <Target className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{averagePoints}</div>
                <p className="text-xs text-muted-foreground mt-1">Community avg</p>
              </CardContent>
            </Card>

            {userProfile && currentUser ? (
              <Card className="relative overflow-hidden border-primary bg-primary/5">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">Your Rank</CardTitle>
                    <div className="p-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">#{currentUserRank || 'N/A'}</div>
                  <p className="text-xs text-muted-foreground mt-1">{currentUser.points || 0} points</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="relative overflow-hidden">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">Competition</CardTitle>
                    <div className="p-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">Live</div>
                  <p className="text-xs text-muted-foreground mt-1">Join the race</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Top 3 Podium */}
          {topUsers.length >= 3 && (
            <div className="grid grid-cols-3 gap-4">
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
              <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/20">
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-2" />
                  <h3 className="font-semibold text-lg">{topUsers[0]?.name}</h3>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{topUsers[0]?.points || 0}</p>
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

          {/* Responsive navigation */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-6">
            <div className="lg:hidden mb-4">
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="flex-wrap">
                  <TabsTrigger value="top10">Top {topLimit} ({Math.min(topUsers.length, topLimit)})</TabsTrigger>
                  <TabsTrigger value="all">All Members ({allUsers.length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
              <Card className="sticky top-24">
                <CardContent className="p-3">
                  <nav className="space-y-1">
                    {[
                      { key: 'top10', label: `Top ${topLimit} (${Math.min(topUsers.length, topLimit)})`, icon: LayoutDashboard },
                      { key: 'all', label: `All Members (${allUsers.length})`, icon: Users },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setActiveSection(key)}
                        className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                          activeSection === key ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Current User Stats - Only show in sidebar on desktop */}
              {userProfile && currentUser && (
                <Card className="mt-4 bg-primary/5 border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4" />
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <p className="text-lg font-bold">#{currentUserRank || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">Current Rank</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{currentUser.points || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Points</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">
                        {allUsers.length > 0 
                          ? Math.round(((allUsers.length - (currentUserRank - 1)) / allUsers.length) * 100)
                          : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Percentile</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </aside>

            {/* Content */}
            <div className="lg:col-span-9 xl:col-span-10 space-y-6 mt-6 lg:mt-0">
              <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
                <TabsList className="lg:hidden" />

                <TabsContent value="top10" className="space-y-6">
                  <Leaderboard 
                    users={topUsers} 
                    currentUserId={userProfile?.uid}
                  />
                </TabsContent>

                <TabsContent value="all" className="space-y-6">
                  <Leaderboard 
                    users={allUsers} 
                    currentUserId={userProfile?.uid}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
