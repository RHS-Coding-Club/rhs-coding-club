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
import { Save, Loader2, Building2, Sparkles, Mail, MapPin, Calendar, Clock, Check, AlertCircle } from 'lucide-react';
import { useClubSettings } from '@/contexts/club-settings-context';
import { Badge } from '@/components/ui/badge';

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
    const changed = JSON.stringify(formData) !== JSON.stringify(initialData);
    setHasChanges(changed);
  }, [formData, initialData]);

  const loadSettings = async () => {
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
      <div className="w-full max-w-5xl mx-auto">
        <Card className="border-0 shadow-lg">
          <CardContent className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading club information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requiredFields = ['clubName', 'tagline', 'description', 'missionStatement', 'contactEmail', 'meetingLocation', 'meetingSchedule'];
  const requiredFilled = requiredFields.filter(field => formData[field as keyof typeof formData].trim() !== '').length;
  const isComplete = requiredFilled === requiredFields.length;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader className="pb-8">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
                    <Building2 className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      Club Information
                    </CardTitle>
                    <CardDescription className="text-base mt-1.5">
                      Configure your club&apos;s identity and essential details
                    </CardDescription>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Badge 
                  variant={isComplete ? "default" : "secondary"} 
                  className="gap-2 px-3 py-1.5 shadow-sm"
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  <span className="font-medium">{requiredFilled}/{requiredFields.length} Required</span>
                </Badge>
                {hasChanges && (
                  <Badge variant="outline" className="gap-2 px-3 py-1.5 border-orange-500/50 text-orange-700 dark:text-orange-400">
                    <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                    Unsaved
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Brand Identity */}
          <div className="space-y-6">
            {/* Brand Identity Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Identity</CardTitle>
                </div>
                <CardDescription>Define your club&apos;s public identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2.5">
                  <Label htmlFor="clubName" className="text-sm font-semibold flex items-center gap-2">
                    Club Name
                    <span className="text-xs text-destructive font-normal">Required</span>
                  </Label>
                  <Input
                    id="clubName"
                    value={formData.clubName}
                    onChange={(e) => handleChange('clubName', e.target.value)}
                    placeholder="RHS Coding Club"
                    required
                    className="h-11 text-base border-2 focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="tagline" className="text-sm font-semibold flex items-center gap-2">
                    Tagline
                    <span className="text-xs text-destructive font-normal">Required</span>
                  </Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    placeholder="Learn. Code. Create."
                    required
                    className="h-11 text-base border-2 focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-2">
                    Club Description
                    <span className="text-xs text-destructive font-normal">Required</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="A brief, compelling description of your coding club that captures what makes it special..."
                    rows={4}
                    required
                    className="resize-none text-base border-2 focus:border-primary transition-all"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" />
                    Used for SEO and social sharing
                  </p>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="missionStatement" className="text-sm font-semibold flex items-center gap-2">
                    Mission Statement
                    <span className="text-xs text-destructive font-normal">Required</span>
                  </Label>
                  <Textarea
                    id="missionStatement"
                    value={formData.missionStatement}
                    onChange={(e) => handleChange('missionStatement', e.target.value)}
                    placeholder="Our mission is to empower students through technology and foster a community of passionate developers..."
                    rows={4}
                    required
                    className="resize-none text-base border-2 focus:border-primary transition-all"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Meeting Info */}
          <div className="space-y-6">
            {/* Contact Information Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Contact Information</CardTitle>
                </div>
                <CardDescription>How members can reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2.5">
                  <Label htmlFor="contactEmail" className="text-sm font-semibold flex items-center gap-2">
                    Primary Email
                    <span className="text-xs text-destructive font-normal">Required</span>
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    placeholder="club@school.edu"
                    required
                    className="h-11 text-base border-2 focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="secondaryEmail" className="text-sm font-semibold flex items-center gap-2">
                    Secondary Email
                    <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
                  </Label>
                  <Input
                    id="secondaryEmail"
                    type="email"
                    value={formData.secondaryEmail}
                    onChange={(e) => handleChange('secondaryEmail', e.target.value)}
                    placeholder="president@school.edu"
                    className="h-11 text-base border-2 focus:border-primary transition-all"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Meeting Details Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Meeting Details</CardTitle>
                </div>
                <CardDescription>Where and when you meet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2.5">
                  <Label htmlFor="meetingLocation" className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                    <span className="text-xs text-destructive font-normal">Required</span>
                  </Label>
                  <Input
                    id="meetingLocation"
                    value={formData.meetingLocation}
                    onChange={(e) => handleChange('meetingLocation', e.target.value)}
                    placeholder="Room 101, Computer Lab"
                    required
                    className="h-11 text-base border-2 focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="meetingSchedule" className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Schedule
                    <span className="text-xs text-destructive font-normal">Required</span>
                  </Label>
                  <Input
                    id="meetingSchedule"
                    value={formData.meetingSchedule}
                    onChange={(e) => handleChange('meetingSchedule', e.target.value)}
                    placeholder="Every Tuesday & Thursday, 3:30 PM - 5:00 PM"
                    required
                    className="h-11 text-base border-2 focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="officeHours" className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Office Hours
                    <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
                  </Label>
                  <Input
                    id="officeHours"
                    value={formData.officeHours}
                    onChange={(e) => handleChange('officeHours', e.target.value)}
                    placeholder="Monday & Wednesday, 3:00 PM - 4:00 PM"
                    className="h-11 text-base border-2 focus:border-primary transition-all"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Bar */}
        <Card className="border-0 shadow-lg sticky bottom-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasChanges ? (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2.5 w-2.5 bg-orange-500 rounded-full animate-pulse" />
                    <span className="font-medium text-orange-700 dark:text-orange-400">You have unsaved changes</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>All changes saved</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasChanges || saving}
                  className="min-w-[100px]"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={!hasChanges || saving}
                  className="gap-2 min-w-[140px] shadow-lg shadow-primary/25"
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
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
