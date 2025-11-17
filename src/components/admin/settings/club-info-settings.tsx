'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { 
  getClubSettings, 
  updateClubSettings, 
  initializeClubSettings
} from '@/lib/services/settings';
import { Save, Loader2, Building2 } from 'lucide-react';
import { useClubSettings } from '@/contexts/club-settings-context';

export function ClubInfoSettings() {
  const { userProfile } = useAuth();
  const { refetch } = useClubSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [formData, setFormData] = useState({
    clubName: '',
    tagline: '',
    description: '',
    missionStatement: '',
    contactEmail: '',
    secondaryEmail: '',
    meetingLocation: '',
    meetingSchedule: '',
    officeHours: '',
  });

  const [initialData, setInitialData] = useState(formData);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      
      let settings = await getClubSettings();
      
      if (!settings && userProfile?.uid) {
        await initializeClubSettings(userProfile.uid);
        settings = await getClubSettings();
      }

      if (settings) {
        const data = {
          clubName: settings.clubName || '',
          tagline: settings.tagline || '',
          description: settings.description || '',
          missionStatement: settings.missionStatement || '',
          contactEmail: settings.contactEmail || '',
          secondaryEmail: settings.secondaryEmail || '',
          meetingLocation: settings.meetingLocation || '',
          meetingSchedule: settings.meetingSchedule || '',
          officeHours: settings.officeHours || '',
        };
        setFormData(data);
        setInitialData(data);
      }
    } catch (error) {
      console.error('Error loading club settings:', error);
      alert('Failed to load club settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(initialData);
    setHasChanges(changed);
  }, [formData, initialData]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
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
      
      await updateClubSettings(formData, userProfile.uid);
      
      setInitialData(formData);
      setHasChanges(false);
      
      await refetch();
      
      alert('Club information updated successfully!');
    } catch (error) {
      console.error('Error saving club settings:', error);
      alert('Failed to save club settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setHasChanges(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading club information...</p>
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
              <Building2 className="h-5 w-5" />
              Club Information
            </CardTitle>
            <CardDescription className="mt-2">
              Configure your club&apos;s identity, contact information, and meeting details
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Brand Identity */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Brand Identity</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clubName">
                  Club Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="clubName"
                  value={formData.clubName}
                  onChange={(e) => handleChange('clubName', e.target.value)}
                  placeholder="RHS Coding Club"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">
                  Tagline <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="Learn. Code. Create."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Club Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="A brief, compelling description of your coding club..."
                rows={3}
                required
              />
              <p className="text-xs text-muted-foreground">
                Used for SEO and social sharing
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="missionStatement">
                Mission Statement <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="missionStatement"
                value={formData.missionStatement}
                onChange={(e) => handleChange('missionStatement', e.target.value)}
                placeholder="Our mission is to empower students through technology..."
                rows={3}
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  Primary Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  placeholder="club@school.edu"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryEmail">Secondary Email</Label>
                <Input
                  id="secondaryEmail"
                  type="email"
                  value={formData.secondaryEmail}
                  onChange={(e) => handleChange('secondaryEmail', e.target.value)}
                  placeholder="president@school.edu"
                />
              </div>
            </div>
          </div>

          {/* Meeting Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Meeting Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="meetingLocation">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="meetingLocation"
                  value={formData.meetingLocation}
                  onChange={(e) => handleChange('meetingLocation', e.target.value)}
                  placeholder="Room 101, Computer Lab"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetingSchedule">
                  Schedule <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="meetingSchedule"
                  value={formData.meetingSchedule}
                  onChange={(e) => handleChange('meetingSchedule', e.target.value)}
                  placeholder="Every Tuesday & Thursday, 3:30 PM - 5:00 PM"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="officeHours">Office Hours</Label>
              <Input
                id="officeHours"
                value={formData.officeHours}
                onChange={(e) => handleChange('officeHours', e.target.value)}
                placeholder="Monday & Wednesday, 3:00 PM - 4:00 PM"
              />
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
            <Button type="submit" disabled={!hasChanges || saving} className="gap-2">
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
