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
import { Trophy, Award, Target, Calendar, Loader2, Save } from 'lucide-react';

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
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading points settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Points & Gamification
            </CardTitle>
            <CardDescription className="mt-2">
              Configure your club&apos;s reward system and leaderboard settings
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-8">
          {/* Challenge Points */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Challenge Rewards</h3>
            
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="easy-points">Easy Challenges</Label>
                <Input
                  id="easy-points"
                  type="number"
                  min="1"
                  value={settings.challenges?.easy || 50}
                  onChange={(e) => updateChallengePoints('easy', parseInt(e.target.value) || 0)}
                  placeholder="50"
                />
                <p className="text-xs text-muted-foreground">Points for beginner challenges</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medium-points">Medium Challenges</Label>
                <Input
                  id="medium-points"
                  type="number"
                  min="1"
                  value={settings.challenges?.medium || 100}
                  onChange={(e) => updateChallengePoints('medium', parseInt(e.target.value) || 0)}
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground">Points for intermediate challenges</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hard-points">Hard Challenges</Label>
                <Input
                  id="hard-points"
                  type="number"
                  min="1"
                  value={settings.challenges?.hard || 200}
                  onChange={(e) => updateChallengePoints('hard', parseInt(e.target.value) || 0)}
                  placeholder="200"
                />
                <p className="text-xs text-muted-foreground">Points for advanced challenges</p>
              </div>
            </div>
          </div>

          {/* Activity Points */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Activity Bonuses</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project-points" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Project Submission
                </Label>
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
                  placeholder="150"
                />
                <p className="text-xs text-muted-foreground">
                  Points per approved project
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-points" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Attendance
                </Label>
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
                  placeholder="25"
                />
                <p className="text-xs text-muted-foreground">
                  Points per event attended
                </p>
              </div>
            </div>
          </div>

          {/* Leaderboard Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Leaderboard Configuration</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="display-type">Ranking Period</Label>
                <Select
                  value={settings.leaderboardOptions?.displayType || 'all'}
                  onValueChange={(value) => updateLeaderboardOptions('displayType', value)}
                >
                  <SelectTrigger id="display-type">
                    <SelectValue placeholder="Select display type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time Rankings</SelectItem>
                    <SelectItem value="weekly">Weekly Reset</SelectItem>
                    <SelectItem value="monthly">Monthly Reset</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How rankings are calculated
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="show-top">Top Players Display</Label>
                <Input
                  id="show-top"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.leaderboardOptions?.showTop || 10}
                  onChange={(e) => updateLeaderboardOptions('showTop', parseInt(e.target.value) || 10)}
                  placeholder="10"
                />
                <p className="text-xs text-muted-foreground">
                  Number of top members shown
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || saving}
            >
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
