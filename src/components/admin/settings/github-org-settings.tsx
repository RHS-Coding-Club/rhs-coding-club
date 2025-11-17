'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/auth-context';
import { 
  getGitHubOrgSettings, 
  updateGitHubOrgSettings, 
  initializeGitHubOrgSettings,
  TeamAssignmentRule
} from '@/lib/services/settings';
import { 
  Save, 
  Loader2, 
  Github, 
  UserPlus, 
  Clock, 
  Award, 
  Plus,
  Trash2,
  Settings2,
  Info,
  CheckCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function GitHubOrgSettings() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    organizationName: '',
    autoInvite: false,
    defaultTeam: '',
    defaultTeamName: '',
    inviteExpiryDays: 7,
    welcomeMessage: '',
    requirements: {
      requireVerifiedEmail: true,
      minimumPoints: 0,
      requireEventAttendance: false,
    },
    teamAssignmentRules: [] as TeamAssignmentRule[],
  });

  const [newRule, setNewRule] = useState<TeamAssignmentRule>({
    teamSlug: '',
    teamName: '',
    condition: '',
    priority: 1,
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      
      let settings = await getGitHubOrgSettings();
      
      if (!settings && userProfile?.uid) {
        await initializeGitHubOrgSettings(userProfile.uid);
        settings = await getGitHubOrgSettings();
      }

      if (settings) {
        setFormData({
          organizationName: settings.organizationName || '',
          autoInvite: settings.autoInvite || false,
          defaultTeam: settings.defaultTeam || '',
          defaultTeamName: settings.defaultTeamName || '',
          inviteExpiryDays: settings.inviteExpiryDays || 7,
          welcomeMessage: settings.welcomeMessage || '',
          requirements: {
            requireVerifiedEmail: settings.requirements?.requireVerifiedEmail ?? true,
            minimumPoints: settings.requirements?.minimumPoints ?? 0,
            requireEventAttendance: settings.requirements?.requireEventAttendance ?? false,
          },
          teamAssignmentRules: settings.teamAssignmentRules || [],
        });
      }
    } catch (error) {
      console.error('Error loading GitHub org settings:', error);
      alert('Failed to load GitHub organization settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRequirementChange = (field: string, value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [field]: value,
      },
    }));
  };

  const addTeamRule = () => {
    if (!newRule.teamSlug || !newRule.teamName || !newRule.condition) {
      alert('Please fill in all team rule fields');
      return;
    }

    setFormData(prev => ({
      ...prev,
      teamAssignmentRules: [
        ...prev.teamAssignmentRules,
        { ...newRule, priority: prev.teamAssignmentRules.length + 1 },
      ],
    }));

    setNewRule({
      teamSlug: '',
      teamName: '',
      condition: '',
      priority: 1,
    });
    setShowTeamDialog(false);
  };

  const removeTeamRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamAssignmentRules: prev.teamAssignmentRules
        .filter((_, i) => i !== index)
        .map((rule, i) => ({ ...rule, priority: i + 1 })),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile?.uid) {
      alert('You must be logged in to update settings.');
      return;
    }

    try {
      setSaving(true);
      
      await updateGitHubOrgSettings(formData, userProfile.uid);
      
      alert('GitHub organization settings updated successfully!');
    } catch (error) {
      console.error('Error saving GitHub org settings:', error);
      alert('Failed to save GitHub organization settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading GitHub organization settings...</p>
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
              <Github className="h-5 w-5" />
              GitHub Organization Settings
            </CardTitle>
            <CardDescription className="mt-2">
              Configure GitHub organization membership settings, requirements, and team assignments
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Info Alert */}
          <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 dark:text-blue-200 font-medium">GitHub Integration</p>
              <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                These settings control how users can join your GitHub organization. Ensure your GitHub token has proper permissions.
              </p>
            </div>
          </div>

          {/* Organization Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Organization Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="organizationName">
                  Organization Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={(e) => handleChange('organizationName', e.target.value)}
                  placeholder="e.g., RHS-Coding-Club"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your GitHub organization username
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteExpiryDays">Invitation Expiry (days)</Label>
                <Input
                  id="inviteExpiryDays"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.inviteExpiryDays}
                  onChange={(e) => handleChange('inviteExpiryDays', parseInt(e.target.value) || 7)}
                />
                <p className="text-xs text-muted-foreground">
                  How long invitations remain valid (1-30 days)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">
                Welcome Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="welcomeMessage"
                value={formData.welcomeMessage}
                onChange={(e) => handleChange('welcomeMessage', e.target.value)}
                placeholder="Welcome to our GitHub organization! We're excited to have you..."
                className="min-h-[100px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                This message will be displayed on the membership request page
              </p>
            </div>
          </div>

          {/* Invitation Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Invitation Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <UserPlus className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label htmlFor="autoInvite" className="text-sm font-medium cursor-pointer">
                      Auto-Invite on Approval
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automatically send GitHub invites when requests are approved
                    </p>
                  </div>
                </div>
                <Switch
                  id="autoInvite"
                  checked={formData.autoInvite}
                  onCheckedChange={(checked) => handleChange('autoInvite', checked)}
                />
              </div>
            </div>
          </div>

          {/* Default Team */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Default Team Assignment</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="defaultTeamName">Team Name</Label>
                <Input
                  id="defaultTeamName"
                  value={formData.defaultTeamName}
                  onChange={(e) => handleChange('defaultTeamName', e.target.value)}
                  placeholder="e.g., Members"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultTeam">Team Slug</Label>
                <Input
                  id="defaultTeam"
                  value={formData.defaultTeam}
                  onChange={(e) => handleChange('defaultTeam', e.target.value)}
                  placeholder="e.g., members"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to disable automatic team assignment
            </p>
          </div>

          {/* Access Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Access Requirements</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label htmlFor="requireVerifiedEmail" className="text-sm font-medium cursor-pointer">
                      Require Verified Email
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Users must have a verified email address to join
                    </p>
                  </div>
                </div>
                <Switch
                  id="requireVerifiedEmail"
                  checked={formData.requirements.requireVerifiedEmail}
                  onCheckedChange={(checked) => handleRequirementChange('requireVerifiedEmail', checked)}
                />
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="minimumPoints" className="text-sm font-medium">
                      Minimum Points Requirement
                    </Label>
                    <Input
                      id="minimumPoints"
                      type="number"
                      min="0"
                      value={formData.requirements.minimumPoints}
                      onChange={(e) => handleRequirementChange('minimumPoints', parseInt(e.target.value) || 0)}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Set to 0 for no minimum requirement
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label htmlFor="requireEventAttendance" className="text-sm font-medium cursor-pointer">
                      Require Event Attendance
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Users must attend at least one event to join
                    </p>
                  </div>
                </div>
                <Switch
                  id="requireEventAttendance"
                  checked={formData.requirements.requireEventAttendance}
                  onCheckedChange={(checked) => handleRequirementChange('requireEventAttendance', checked)}
                />
              </div>
            </div>
          </div>

          {/* Team Assignment Rules */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Team Assignment Rules</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Advanced conditional team assignments based on user criteria
                </p>
              </div>
              <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Rule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Assignment Rule</DialogTitle>
                    <DialogDescription>
                      Create a rule to automatically assign users to teams based on conditions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="newTeamName">Team Name</Label>
                      <Input
                        id="newTeamName"
                        value={newRule.teamName}
                        onChange={(e) => setNewRule({ ...newRule, teamName: e.target.value })}
                        placeholder="e.g., Advanced Developers"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newTeamSlug">Team Slug</Label>
                      <Input
                        id="newTeamSlug"
                        value={newRule.teamSlug}
                        onChange={(e) => setNewRule({ ...newRule, teamSlug: e.target.value })}
                        placeholder="e.g., advanced-developers"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newCondition">Condition</Label>
                      <Textarea
                        id="newCondition"
                        value={newRule.condition}
                        onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                        placeholder="e.g., Points > 500 OR Completed 5+ challenges"
                        className="min-h-[80px]"
                      />
                    </div>
                    <Button onClick={addTeamRule} className="w-full">
                      Add Rule
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {formData.teamAssignmentRules.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/30">
                <Settings2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No team assignment rules configured</p>
                <p className="text-xs text-muted-foreground mt-1">Click &quot;Add Rule&quot; to create conditional team assignments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.teamAssignmentRules.map((rule, index) => (
                  <div 
                    key={index}
                    className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Priority {rule.priority}
                        </span>
                        <p className="font-medium text-sm">{rule.teamName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Slug: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{rule.teamSlug}</code>
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {rule.condition}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeamRule(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={loadSettings}
              disabled={saving}
            >
              Reset
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
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
        </form>
      </CardContent>
    </Card>
  );
}
