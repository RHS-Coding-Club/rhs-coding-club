'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { 
  getClubSettings, 
  updateClubSettings, 
  initializeClubSettings,
  ClubSettings 
} from '@/lib/services/settings';
import { Save, Loader2, Info, Mail, MapPin, Calendar, Clock } from 'lucide-react';
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

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // Check if form has changes
    const changed = JSON.stringify(formData) !== JSON.stringify(initialData);
    setHasChanges(changed);
  }, [formData, initialData]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Try to get existing settings
      let settings = await getClubSettings();
      
      // If no settings exist, initialize with defaults
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
  };

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
      
      // Refetch club settings globally to update all pages
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
        <CardHeader>
          <CardTitle>Club Information Settings</CardTitle>
          <CardDescription>Configure basic club information and contact details</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Club Information Settings
        </CardTitle>
        <CardDescription>
          Configure basic club information and contact details. This information will be displayed across the website.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
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
                  placeholder="Learn Programming & Build Projects"
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
                placeholder="A brief description of your coding club..."
                rows={3}
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be used in meta descriptions and search results.
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
                placeholder="Your club's mission and goals..."
                rows={3}
                required
              />
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  Primary Contact Email <span className="text-destructive">*</span>
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
                <Label htmlFor="secondaryEmail">Secondary Contact Email</Label>
                <Input
                  id="secondaryEmail"
                  type="email"
                  value={formData.secondaryEmail}
                  onChange={(e) => handleChange('secondaryEmail', e.target.value)}
                  placeholder="president@school.edu (optional)"
                />
              </div>
            </div>
          </div>

          {/* Meeting Information Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Meeting Information
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meetingLocation" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Meeting Location <span className="text-destructive">*</span>
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
                  Meeting Schedule <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="meetingSchedule"
                  value={formData.meetingSchedule}
                  onChange={(e) => handleChange('meetingSchedule', e.target.value)}
                  placeholder="Every Tuesday and Thursday, 3:30 PM - 5:00 PM"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="officeHours" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Office Hours
                </Label>
                <Input
                  id="officeHours"
                  value={formData.officeHours}
                  onChange={(e) => handleChange('officeHours', e.target.value)}
                  placeholder="After school, by appointment (optional)"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div>
              {hasChanges && (
                <p className="text-sm text-muted-foreground">
                  You have unsaved changes
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || saving}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={!hasChanges || saving}
                className="gap-2"
              >
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
        </form>
      </CardContent>
    </Card>
  );
}
