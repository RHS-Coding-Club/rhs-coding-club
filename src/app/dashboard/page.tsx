'use client';

import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { Calendar, Users, Trophy, BookOpen } from 'lucide-react';

export default function DashboardPage() {
  const { userProfile } = useAuth();

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
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">2 active, 3 completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Challenge Points</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,250</div>
                <p className="text-xs text-muted-foreground">Rank #8 in club</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Learning Path</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">65%</div>
                <p className="text-xs text-muted-foreground">JavaScript Fundamentals</p>
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completed React Workshop</span>
                      <span className="text-xs text-muted-foreground">2 days ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Submitted Binary Tree Challenge</span>
                      <span className="text-xs text-muted-foreground">5 days ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Joined Event Management Project</span>
                      <span className="text-xs text-muted-foreground">1 week ago</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Algorithm Workshop</span>
                      <span className="text-xs text-muted-foreground">Sept 15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Coding Competition</span>
                      <span className="text-xs text-muted-foreground">Sept 22</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Guest Speaker Event</span>
                      <span className="text-xs text-muted-foreground">Sept 29</span>
                    </div>
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
                  <p className="text-muted-foreground">
                    Your project contributions and collaborations will appear here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="challenges" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Challenge Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Track your coding challenge submissions and scores.
                  </p>
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
                    Access your bookmarked resources and learning materials.
                  </p>
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
