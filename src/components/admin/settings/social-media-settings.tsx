'use client';

import { useState, useEffect } from 'react';
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
import { Save, Loader2, Share2, ExternalLink, Plus, Trash2, Instagram, Twitter, Linkedin, Youtube, Github, MessageSquare, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
  };

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
    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourclub', color: 'text-pink-600 dark:text-pink-400' },
    { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/yourclub', color: 'text-blue-500 dark:text-blue-400' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/yourclub', color: 'text-blue-700 dark:text-blue-500' },
    { key: 'discord', label: 'Discord', icon: MessageSquare, placeholder: 'https://discord.gg/invite', color: 'text-indigo-600 dark:text-indigo-400' },
    { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/yourclub', color: 'text-gray-800 dark:text-gray-300' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@yourclub', color: 'text-red-600 dark:text-red-400' },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>Configure your club&apos;s social media presence</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader className="space-y-1 pb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Share2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Social Media Links</CardTitle>
            <CardDescription className="text-base mt-1">
              Connect your club&apos;s social media accounts and build your online presence
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Social Platforms */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Primary Platforms</h3>
              <Badge variant="outline" className="gap-1.5">
                <LinkIcon className="h-3 w-3" />
                {socialPlatforms.filter(p => formData[p.key as keyof typeof formData]).length} / {socialPlatforms.length} connected
              </Badge>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {socialPlatforms.map(({ key, label, icon: Icon, placeholder, color }) => (
                <div key={key} className="space-y-3 group">
                  <Label htmlFor={key} className="flex items-center gap-2 text-sm font-medium">
                    <Icon className={`h-4 w-4 ${color}`} />
                    {label}
                  </Label>
                  <div className="relative">
                    <Input
                      id={key}
                      type="url"
                      value={formData[key as keyof typeof formData] as string}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={placeholder}
                      className="pr-10 transition-all group-hover:border-primary/50"
                    />
                    {formData[key as keyof typeof formData] && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => window.open(formData[key as keyof typeof formData] as string, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Custom Links Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Custom Links</h3>
                <p className="text-sm text-muted-foreground mt-1">
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
                  <Card key={index} className="p-4 bg-muted/30">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor={`custom-name-${index}`} className="text-xs">
                          Platform Name
                        </Label>
                        <Input
                          id={`custom-name-${index}`}
                          value={link.name}
                          onChange={(e) => updateCustomLink(index, 'name', e.target.value)}
                          placeholder="e.g., Slack, WhatsApp"
                          className="bg-background"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor={`custom-url-${index}`} className="text-xs">
                          URL
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`custom-url-${index}`}
                            type="url"
                            value={link.url}
                            onChange={(e) => updateCustomLink(index, 'url', e.target.value)}
                            placeholder="https://..."
                            className="bg-background flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCustomLink(index)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <LinkIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No custom links added yet</p>
                <p className="text-xs text-muted-foreground mt-1">Click &quot;Add Link&quot; to create one</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div>
              {hasChanges && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                  <p className="text-sm text-muted-foreground">
                    You have unsaved changes
                  </p>
                </div>
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
                className="gap-2 min-w-[140px]"
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
