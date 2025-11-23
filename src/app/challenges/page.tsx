'use client';

import { useState } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Code, 
  Award, 
  Target, 
  Clock, 
  Users, 
  LayoutDashboard,
  TrendingUp
} from 'lucide-react';
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
  const [activeSection, setActiveSection] = useState<string>('challenges');

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
          <div className="max-w-7xl mx-auto space-y-8">
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
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Coding Challenges</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Test your programming skills with our weekly coding challenges.
              Solve problems, earn points, and climb the leaderboard.
            </p>
          </div>

          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Total Challenges</CardTitle>
                  <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Target className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{challenges.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Problems to solve</p>
              </CardContent>
            </Card>

            {userProfile && (
              <>
                <Card className="relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
                      <div className="p-2 rounded-md bg-green-500/10 text-green-600 dark:text-green-400">
                        <Code className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">{stats.completedChallenges}</div>
                    <p className="text-xs text-muted-foreground mt-1">Your solutions</p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-muted-foreground">Points Earned</CardTitle>
                      <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Trophy className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">{stats.totalPoints}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total score</p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-muted-foreground">Success Rate</CardTitle>
                      <div className="p-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Award className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">
                      {stats.totalChallenges > 0 
                        ? Math.round((stats.completedChallenges / stats.totalChallenges) * 100)
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Accuracy</p>
                  </CardContent>
                </Card>
              </>
            )}

            {!userProfile && (
              <>
                <Card className="relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-muted-foreground">Active Users</CardTitle>
                      <div className="p-2 rounded-md bg-green-500/10 text-green-600 dark:text-green-400">
                        <Users className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">{leaderboard.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Participants</p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-muted-foreground">Weekly</CardTitle>
                      <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Clock className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">New</div>
                    <p className="text-xs text-muted-foreground mt-1">Fresh challenges</p>
                  </CardContent>
                </Card>

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
                    <p className="text-xs text-muted-foreground mt-1">Leaderboard</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Responsive navigation */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-6">
            <div className="lg:hidden mb-4">
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="flex-wrap">
                  <TabsTrigger value="challenges">Challenges ({filteredChallenges.length})</TabsTrigger>
                  <TabsTrigger value="leaderboard">Leaderboard ({leaderboard.length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
              <Card className="sticky top-24">
                <CardContent className="p-3">
                  <nav className="space-y-1">
                    {[
                      { key: 'challenges', label: `Challenges (${filteredChallenges.length})`, icon: LayoutDashboard },
                      { key: 'leaderboard', label: `Leaderboard (${leaderboard.length})`, icon: Trophy },
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
            </aside>

            {/* Content */}
            <div className="lg:col-span-9 xl:col-span-10 space-y-6 mt-6 lg:mt-0">
              <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
                <TabsList className="lg:hidden" />

                <TabsContent value="challenges" className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-lg border">
                    <ChallengeFilters
                      selectedDifficulty={selectedDifficulty}
                      selectedStatus={selectedStatus}
                      onDifficultyChange={setSelectedDifficulty}
                      onStatusChange={setSelectedStatus}
                      onClearFilters={clearFilters}
                    />
                    
                    {(userProfile?.role === 'admin' || userProfile?.role === 'officer') && (
                      <Link href="/admin#challenges">
                        <Button>Manage Challenges</Button>
                      </Link>
                    )}
                  </div>

                  <div className="grid gap-6">
                    {filteredChallenges.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No challenges found</h3>
                          <p className="text-muted-foreground">
                            No challenges found matching your filters. Try adjusting your criteria.
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

                <TabsContent value="leaderboard" className="space-y-6">
                  <Leaderboard 
                    users={leaderboard} 
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
