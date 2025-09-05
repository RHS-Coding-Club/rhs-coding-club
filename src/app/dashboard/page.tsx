'use client';

import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Calendar, Users, Trophy, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const { stats, recentActivity, upcomingEvents, userProjects, userChallenges, loading, error } = useDashboardData();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'officer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'member':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'officer', 'member']}>
        <div className="py-20">
          <Container>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading dashboard...</span>
              </div>
            </div>
          </Container>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'officer', 'member']}>
        <div className="py-20">
          <Container>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-6 w-6" />
                <span>{error}</span>
              </div>
            </div>
          </Container>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'officer', 'member']}>
      <div className="py-20">
        <Container>
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                  Welcome back, {userProfile?.displayName}!
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={getRoleColor(userProfile?.role || 'guest')}
              >
                {userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : 'Guest'}
              </Badge>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.eventsAttended}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.eventsAttended > 0 ? 'Active participant' : 'Join an event!'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeProjects} active, {stats.completedProjects} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Challenge Points</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.challengePoints.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Rank #{stats.userRank} of {stats.totalUsers}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userChallenges.length}</div>
                <p className="text-xs text-muted-foreground">
                  {userChallenges.filter(c => c.status === 'pass').length} passed
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">My Projects</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-sm font-medium">{activity.title}</span>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(activity.date, { addSuffix: true })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-sm font-medium">{event.title}</span>
                            <p className="text-xs text-muted-foreground">{event.location}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {event.date.toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No upcoming events</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {userProjects.length > 0 ? (
                    <div className="space-y-4">
                      {userProjects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold">{project.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {project.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {project.tech.slice(0, 3).map((tech, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                                {project.tech.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{project.tech.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant={project.approved ? "default" : "secondary"}>
                              {project.approved ? "Approved" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No projects yet. Create your first project to showcase your work!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="challenges" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Challenge Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  {userChallenges.length > 0 ? (
                    <div className="space-y-4">
                      {userChallenges.slice(0, 5).map((submission) => (
                        <div key={submission.id} className="flex items-center justify-between border rounded-lg p-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium">Challenge Submission</p>
                            <p className="text-xs text-muted-foreground">
                              Language: {submission.language} • Points: {submission.points}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              submission.status === 'pass' ? 'default' :
                              submission.status === 'fail' ? 'destructive' : 'secondary'
                            }>
                              {submission.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                submission.submittedAt && typeof submission.submittedAt.toDate === 'function'
                                  ? submission.submittedAt.toDate()
                                  : new Date(),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                      {userChallenges.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{userChallenges.length - 5} more submissions
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No challenge submissions yet. Start solving challenges to earn points!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Learning Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Bookmarked resources and learning materials will appear here in a future update.
                  </p>
                  <div className="mt-4">
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </div>
    </ProtectedRoute>
  );
}
