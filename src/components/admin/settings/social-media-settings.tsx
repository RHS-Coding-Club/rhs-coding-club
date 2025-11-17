'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { useSocialMedia } from '@/contexts/social-media-context';
import { 
  getSocialMediaSettings, 
  updateSocialMediaSettings, 
  initializeSocialMediaSettings,
  CustomSocialLink 
} from '@/lib/services/settings';
import { Save, Loader2, Share2, ExternalLink, Plus, Trash2, Instagram, Twitter, Linkedin, Youtube, Github, MessageSquare } from 'lucide-react';

export function SocialMediaSettings() {
  const { userProfile } = useAuth();
  const { refetch: refetchSocialMedia } = useSocialMedia();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [formData, setFormData] = useState({
    instagram: '',
    twitter: '',
    linkedin: '',
    discord: '',
    github: '',
    youtube: '',
    customLinks: [] as CustomSocialLink[],
  });

  const [initialData, setInitialData] = useState(formData);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      
      let settings = await getSocialMediaSettings();
      
      if (!settings && userProfile?.uid) {
        await initializeSocialMediaSettings(userProfile.uid);
        settings = await getSocialMediaSettings();
      }

      if (settings) {
        const data = {
          instagram: settings.instagram || '',
          twitter: settings.twitter || '',
          linkedin: settings.linkedin || '',
          discord: settings.discord || '',
          github: settings.github || '',
          youtube: settings.youtube || '',
          customLinks: settings.customLinks || [],
        };
        setFormData(data);
        setInitialData(data);
      }
    } catch (error) {
      console.error('Error loading social media settings:', error);
      alert('Failed to load social media settings. Please try again.');
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

  const addCustomLink = () => {
    setFormData(prev => ({
      ...prev,
      customLinks: [...prev.customLinks, { name: '', url: '', icon: '' }],
    }));
  };

  const removeCustomLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customLinks: prev.customLinks.filter((_, i) => i !== index),
    }));
  };

  const updateCustomLink = (index: number, field: keyof CustomSocialLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      customLinks: prev.customLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Empty is valid (optional)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile?.uid) {
      alert('You must be logged in to update settings.');
      return;
    }

    // Validate URLs
    const urlFields = ['instagram', 'twitter', 'linkedin', 'discord', 'github', 'youtube'];
    for (const field of urlFields) {
      const url = formData[field as keyof typeof formData] as string;
      if (url && !validateUrl(url)) {
        alert(`Invalid URL for ${field}. Please enter a valid URL or leave it empty.`);
        return;
      }
    }

    // Validate custom links
    for (const link of formData.customLinks) {
      if (link.url && !validateUrl(link.url)) {
        alert(`Invalid URL for custom link "${link.name}". Please enter a valid URL.`);
        return;
      }
      if (link.url && !link.name) {
        alert('Please provide a name for all custom links.');
        return;
      }
    }

    try {
      setSaving(true);
      
      await updateSocialMediaSettings(formData, userProfile.uid);
      
      setInitialData(formData);
      setHasChanges(false);
      
      // Refetch settings globally to update entire app
      await refetchSocialMedia();
      
      alert('Social media links updated successfully!');
    } catch (error) {
      console.error('Error saving social media settings:', error);
      alert('Failed to save social media settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setHasChanges(false);
  };

  const socialPlatforms = [
    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourclub' },
    { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/yourclub' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/yourclub' },
    { key: 'discord', label: 'Discord', icon: MessageSquare, placeholder: 'https://discord.gg/invite' },
    { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/yourclub' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@yourclub' },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading social media settings...</p>
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
              <Share2 className="h-5 w-5" />
              Social Media Links
            </CardTitle>
            <CardDescription className="mt-2">
              Configure your club&apos;s social media presence and custom links
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Social Platforms */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Primary Platforms</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {socialPlatforms.map(({ key, label, icon: Icon, placeholder }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </Label>
                  <div className="relative">
                    <Input
                      id={key}
                      type="url"
                      value={formData[key as keyof typeof formData] as string}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={placeholder}
                      className="pr-10"
                    />
                    {formData[key as keyof typeof formData] && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => window.open(formData[key as keyof typeof formData] as string, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Links Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Custom Links</h3>
                <p className="text-sm text-muted-foreground">
                  Add additional social or community platforms
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomLink}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Link
              </Button>
            </div>

            {formData.customLinks.length > 0 ? (
              <div className="space-y-4">
                {formData.customLinks.map((link, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor={`custom-name-${index}`}>
                          Platform Name
                        </Label>
                        <Input
                          id={`custom-name-${index}`}
                          value={link.name}
                          onChange={(e) => updateCustomLink(index, 'name', e.target.value)}
                          placeholder="e.g., Slack, WhatsApp"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <Label htmlFor={`custom-url-${index}`}>
                          URL
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`custom-url-${index}`}
                            type="url"
                            value={link.url}
                            onChange={(e) => updateCustomLink(index, 'url', e.target.value)}
                            placeholder="https://..."
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCustomLink(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">No custom links added yet</p>
                <p className="text-xs text-muted-foreground mt-1">Click &quot;Add Link&quot; to create one</p>
              </div>
            )}
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
