'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { 
  getPointsSettings, 
  updatePointsSettings, 
  initializePointsSettings,
  PointsSettings 
} from '@/lib/services/settings';
import { Trophy, Award, Target, Users, Calendar, Loader2, Save, RotateCcw, Sparkles, Zap, Star, TrendingUp, Gift } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export function PointsSettingsComponent() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Partial<PointsSettings>>({
    challenges: {
      easy: 50,
      medium: 100,
      hard: 200,
    },
    projectSubmission: 150,
    eventAttendance: 25,
    leaderboardOptions: {
      displayType: 'all',
      showTop: 10,
    },
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Initialize if admin
      if (userProfile?.uid) {
        await initializePointsSettings(userProfile.uid);
      }
      
      const data = await getPointsSettings();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading points settings:', error);
      alert('Failed to load points settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userProfile?.uid) {
      alert('You must be logged in to update settings.');
      return;
    }

    try {
      setSaving(true);
      await updatePointsSettings(settings, userProfile.uid);
      setHasChanges(false);
      alert('Points settings updated successfully!');
    } catch (error) {
      console.error('Error saving points settings:', error);
      alert('Failed to save points settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await loadSettings();
      setHasChanges(false);
      alert('Settings reset to saved values.');
    } catch (error) {
      console.error('Error resetting settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChallengePoints = (difficulty: 'easy' | 'medium' | 'hard', value: number) => {
    setSettings(prev => ({
      ...prev,
      challenges: {
        ...prev.challenges!,
        [difficulty]: value,
      },
    }));
    setHasChanges(true);
  };

  const updateLeaderboardOptions = (key: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      leaderboardOptions: {
        ...prev.leaderboardOptions!,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-6 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Points & Gamification</h2>
              <p className="text-muted-foreground mt-1">
                Configure your club&apos;s reward system and leaderboard
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset} disabled={saving} size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saving}
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Challenge Points - Theme Colors */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Challenge Rewards</h3>
          <Badge variant="outline" className="ml-2">Core System</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Easy Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-2/10 rounded-bl-full" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-chart-2/20 group-hover:scale-110 transition-transform">
                    <Star className="h-5 w-5 text-chart-2" />
                  </div>
                  <CardTitle className="text-lg">Easy</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Beginner
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Perfect for newcomers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="easy-points" className="text-sm font-medium">
                  Points Awarded
                </Label>
                <div className="relative">
                  <Input
                    id="easy-points"
                    type="number"
                    min="1"
                    value={settings.challenges?.easy || 50}
                    onChange={(e) => updateChallengePoints('easy', parseInt(e.target.value) || 0)}
                    className="text-2xl font-bold h-14 pl-4 pr-12 border-2 focus:border-chart-2"
                    placeholder="50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                    pts
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medium Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/20 group-hover:scale-110 transition-transform">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Medium</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Intermediate
                </Badge>
              </div>
              <CardDescription className="text-xs">
                For regular members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="medium-points" className="text-sm font-medium">
                  Points Awarded
                </Label>
                <div className="relative">
                  <Input
                    id="medium-points"
                    type="number"
                    min="1"
                    value={settings.challenges?.medium || 100}
                    onChange={(e) => updateChallengePoints('medium', parseInt(e.target.value) || 0)}
                    className="text-2xl font-bold h-14 pl-4 pr-12 border-2 focus:border-primary"
                    placeholder="100"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                    pts
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hard Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-bl-full" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-destructive/20 group-hover:scale-110 transition-transform">
                    <Trophy className="h-5 w-5 text-destructive" />
                  </div>
                  <CardTitle className="text-lg">Hard</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Advanced
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Expert challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="hard-points" className="text-sm font-medium">
                  Points Awarded
                </Label>
                <div className="relative">
                  <Input
                    id="hard-points"
                    type="number"
                    min="1"
                    value={settings.challenges?.hard || 200}
                    onChange={(e) => updateChallengePoints('hard', parseInt(e.target.value) || 0)}
                    className="text-2xl font-bold h-14 pl-4 pr-12 border-2 focus:border-destructive"
                    placeholder="200"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                    pts
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Activity Points - Theme Colors */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Activity Bonuses</h3>
          <Badge variant="outline" className="ml-2">Extra Points</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Project Submission */}
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-chart-3/20 group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-chart-3" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Project Submission</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Reward members for sharing their work
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="project-points" className="text-sm font-medium">
                  Points per Approved Project
                </Label>
                <div className="relative">
                  <Input
                    id="project-points"
                    type="number"
                    min="1"
                    value={settings.projectSubmission || 150}
                    onChange={(e) => {
                      setSettings(prev => ({
                        ...prev,
                        projectSubmission: parseInt(e.target.value) || 0,
                      }));
                      setHasChanges(true);
                    }}
                    className="text-2xl font-bold h-14 pl-4 pr-12 border-2 focus:border-chart-3"
                    placeholder="150"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                    pts
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Gift className="h-3 w-3" />
                  Awarded once the project is approved by admins
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Event Attendance */}
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-chart-1/20 group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-chart-1" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Event Attendance</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Encourage participation in club events
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="event-points" className="text-sm font-medium">
                  Points per Event Attended
                </Label>
                <div className="relative">
                  <Input
                    id="event-points"
                    type="number"
                    min="1"
                    value={settings.eventAttendance || 25}
                    onChange={(e) => {
                      setSettings(prev => ({
                        ...prev,
                        eventAttendance: parseInt(e.target.value) || 0,
                      }));
                      setHasChanges(true);
                    }}
                    className="text-2xl font-bold h-14 pl-4 pr-12 border-2 focus:border-chart-1"
                    placeholder="25"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                    pts
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Awarded for attending workshops, meetings, and events
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Leaderboard Configuration - Theme Colors */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Leaderboard Configuration</h3>
          <Badge variant="outline" className="ml-2">Display Settings</Badge>
        </div>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="display-type" className="text-base font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Ranking Period
                </Label>
                <Select
                  value={settings.leaderboardOptions?.displayType || 'all'}
                  onValueChange={(value) => updateLeaderboardOptions('displayType', value)}
                >
                  <SelectTrigger id="display-type" className="h-12 text-base">
                    <SelectValue placeholder="Select display type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🏆 All Time Rankings</SelectItem>
                    <SelectItem value="weekly">📅 Weekly Reset</SelectItem>
                    <SelectItem value="monthly">📆 Monthly Reset</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose how rankings are calculated and displayed
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="show-top" className="text-base font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Top Players Display
                </Label>
                <div className="relative">
                  <Input
                    id="show-top"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.leaderboardOptions?.showTop || 10}
                    onChange={(e) => updateLeaderboardOptions('showTop', parseInt(e.target.value) || 10)}
                    className="h-12 text-base pl-4 pr-20"
                    placeholder="10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    players
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Number of top members shown on the main leaderboard
                </p>
              </div>
            </div>

            {/* Preview Box */}
            <div className="mt-6 p-5 bg-muted border-2 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary">
                  <Trophy className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold mb-2">
                    Current Leaderboard Settings
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        Top {settings.leaderboardOptions?.showTop || 10}
                      </Badge>
                      <span className="text-muted-foreground">members displayed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {settings.leaderboardOptions?.displayType === 'all' 
                          ? 'All-time' 
                          : (settings.leaderboardOptions?.displayType || 'all').charAt(0).toUpperCase() + (settings.leaderboardOptions?.displayType || 'all').slice(1)}
                      </Badge>
                      <span className="text-muted-foreground">ranking system</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Summary Card */}
      <Card className="border-2 border-primary/20 bg-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Points Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-chart-2">{settings.challenges?.easy || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Easy</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-primary">{settings.challenges?.medium || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Medium</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-destructive">{settings.challenges?.hard || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Hard</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-chart-3">{settings.projectSubmission || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Project</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-card border">
              <div className="text-2xl font-bold text-chart-1">{settings.eventAttendance || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Event</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
