"use client";

import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Calendar, Users, Trophy, BookOpen, Loader2, AlertCircle, LayoutDashboard, FolderOpen, UserPlus, Award } from 'lucide-react';
import { ResourceCard } from '@/components/resources/resource-card';
import { useResourceBookmarks } from '@/hooks/useResourceBookmarks';
import { formatDistanceToNow } from 'date-fns';
import { useState, useMemo } from 'react';
import { MembershipApplication } from '@/components/dashboard/membership-application';
import { AuthForm } from '@/components/auth';
import { BadgeDisplay } from '@/components/ui/badge-display';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const { stats, recentActivity, upcomingEvents, userProjects, userChallenges, loading, error } = useDashboardData();
  const { bookmarkedResources, toggleBookmark, isBookmarked, loading: bookmarksLoading } = useResourceBookmarks();
  const [activeSection, setActiveSection] = useState<string>(userProfile?.role === 'guest' || !userProfile ? 'apply' : 'overview');
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatus, setProjectStatus] = useState<'all' | 'approved' | 'pending'>('all');

  const isGuest = !userProfile || userProfile.role === 'guest';

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

  const filteredProjects = useMemo(() => {
    const q = projectSearch.toLowerCase().trim();
    return userProjects.filter((p) => {
      const matchesQuery = !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tech || []).some((t) => t.toLowerCase().includes(q));
      const matchesStatus = projectStatus === 'all' || (projectStatus === 'approved' ? p.approved : !p.approved);
      return matchesQuery && matchesStatus;
    });
  }, [userProjects, projectSearch, projectStatus]);

  // If not signed in at all, show auth form
  if (!user) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Sign in to access your dashboard
              </p>
            </div>
            <AuthForm />
          </div>
        </Container>
      </div>
    );
  }

  if (loading) {
    return (
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
    );
  }

  if (error && !isGuest) {
    return (
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
    );
  }

  // Guest user view - show only membership application
  if (isGuest) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                  Welcome, {userProfile?.displayName || user.displayName || user.email}!
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={getRoleColor('guest')}
              >
                Guest
              </Badge>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <UserPlus className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Become a Member</h2>
                    <p className="text-muted-foreground mt-1">
                      Apply for membership to unlock full access to the dashboard, events, challenges, and more!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <MembershipApplication />
          </div>
        </Container>
      </div>
    );
  }

  return (
      <div className="py-20">
        <Container>
          <div className="max-w-7xl mx-auto space-y-8">
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

          {/* Stats - modernized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Events Attended</CardTitle>
                  <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400"><Calendar className="h-4 w-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{stats.eventsAttended}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.eventsAttended > 0 ? 'Active participant' : 'Join an event!'}</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Projects</CardTitle>
                  <div className="p-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400"><Users className="h-4 w-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.activeProjects} active • {stats.completedProjects} completed</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Challenge Points</CardTitle>
                  <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400"><Trophy className="h-4 w-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{stats.challengePoints.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Rank #{stats.userRank} of {stats.totalUsers}</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Submissions</CardTitle>
                  <div className="p-2 rounded-md bg-green-500/10 text-green-600 dark:text-green-400"><BookOpen className="h-4 w-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{userChallenges.length}</div>
                <p className="text-xs text-muted-foreground mt-1">{userChallenges.filter(c => c.status === 'pass').length} passed</p>
              </CardContent>
            </Card>
          </div>

          {/* Responsive nav: Tabs for mobile, sidebar for desktop */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-6">
            <div className="lg:hidden mb-4">
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="flex-wrap">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="projects">My Projects</TabsTrigger>
                  <TabsTrigger value="challenges">Challenges</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
              <Card className="sticky top-24">
                <CardContent className="p-3">
                  <nav className="space-y-1">
                    {[
                      { key: 'overview', label: 'Overview', icon: LayoutDashboard },
                      { key: 'projects', label: 'My Projects', icon: FolderOpen },
                      { key: 'challenges', label: 'Challenges', icon: Trophy },
                      { key: 'resources', label: 'Resources', icon: BookOpen },
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
              <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-4">
                <TabsList className="lg:hidden" />

            <TabsContent value="overview" className="space-y-4">
              {/* Achievements/Badges Section */}
              {user && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-500" />
                      <CardTitle>My Badges</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <BadgeDisplay userId={user.uid} maxDisplay={8} size="md" showCount={true} />
                  </CardContent>
                </Card>
              )}

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
                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="md:col-span-2">
                      <Input placeholder="Search by title, description, or tech..." value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} />
                    </div>
                    <Select value={projectStatus} onValueChange={(v) => setProjectStatus(v as 'all' | 'approved' | 'pending')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {userProjects.length > 0 ? (
                    <div className="space-y-4">
                      {filteredProjects.map((project) => (
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
                  <CardTitle>Bookmarked Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookmarksLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading bookmarks...
                    </div>
                  ) : bookmarkedResources.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      You haven&apos;t bookmarked any resources yet. Browse the <span className="underline">Resources</span> page and click the star icon to save resources here.
                    </p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {bookmarkedResources.map(res => (
                        <ResourceCard
                          key={res.id}
                          resource={res}
                          isBookmarked={isBookmarked(res.id)}
                          onToggleBookmark={toggleBookmark}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
