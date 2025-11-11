'use client';

import { useState } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Github, Mail, Send, MapPin, Clock, Calendar as CalendarIcon, Instagram, Twitter, Linkedin, Youtube, MessageSquare, ExternalLink } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { useClubSettings } from '@/contexts/club-settings-context';
import { useSocialMedia } from '@/contexts/social-media-context';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { settings: clubSettings } = useClubSettings();
  const { settings: socialMedia } = useSocialMedia();

  // Social media platforms
  const socialPlatforms = [
    { key: 'instagram', icon: Instagram, label: 'Instagram', url: socialMedia?.instagram, color: 'text-pink-600' },
    { key: 'twitter', icon: Twitter, label: 'Twitter / X', url: socialMedia?.twitter, color: 'text-blue-500' },
    { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', url: socialMedia?.linkedin, color: 'text-blue-700' },
    { key: 'discord', icon: MessageSquare, label: 'Discord', url: socialMedia?.discord, color: 'text-indigo-600' },
    { key: 'github', icon: Github, label: 'GitHub', url: socialMedia?.github, color: 'text-gray-800 dark:text-gray-300' },
    { key: 'youtube', icon: Youtube, label: 'YouTube', url: socialMedia?.youtube, color: 'text-red-600' },
  ].filter(platform => platform.url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error('Please fill out all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Save to Firestore
      addDoc(collection(db, 'contacts'), {
        name,
        email,
        subject,
        message,
        submittedAt: serverTimestamp(),
      });

      // Send email via API route
      await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      toast.success('Your message has been sent!');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
      toast.error('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Contact Us</h1>
            <p className="text-lg text-muted-foreground">
              Have questions or suggestions? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Subject of your message" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Your message..."
                      className="min-h-[150px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : <><Send className="mr-2 h-4 w-4" /> Send Message</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Other Ways to Connect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <a href={`mailto:${clubSettings?.contactEmail || 'rhscodingclub@example.com'}`} className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors">
                    <Mail className="h-6 w-6 text-primary" />
                    <div>
                      <h4 className="font-medium">Primary Email</h4>
                      <p className="text-sm text-muted-foreground">{clubSettings?.contactEmail || 'rhscodingclub@example.com'}</p>
                    </div>
                  </a>
                  {clubSettings?.secondaryEmail && (
                    <a href={`mailto:${clubSettings.secondaryEmail}`} className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors">
                      <Mail className="h-6 w-6 text-primary" />
                      <div>
                        <h4 className="font-medium">Secondary Email</h4>
                        <p className="text-sm text-muted-foreground">{clubSettings.secondaryEmail}</p>
                      </div>
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Social Media Links */}
              {(socialPlatforms.length > 0 || (socialMedia?.customLinks && socialMedia.customLinks.length > 0)) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Follow Us Online</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {socialPlatforms.map(({ key, icon: Icon, label, url, color }) => (
                      <a 
                        key={key}
                        href={url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors group"
                      >
                        <Icon className={`h-6 w-6 ${color} group-hover:scale-110 transition-transform`} />
                        <div className="flex-1">
                          <h4 className="font-medium">{label}</h4>
                          <p className="text-xs text-muted-foreground truncate">{url}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                    
                    {socialMedia?.customLinks && socialMedia.customLinks.map((link, index) => (
                      link.url && link.name && (
                        <a 
                          key={`custom-${index}`}
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors group"
                        >
                          <ExternalLink className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                          <div className="flex-1">
                            <h4 className="font-medium">{link.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                          </div>
                        </a>
                      )
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Meeting Information */}
              {(clubSettings?.meetingLocation || clubSettings?.meetingSchedule || clubSettings?.officeHours) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {clubSettings?.meetingLocation && (
                      <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                        <MapPin className="h-6 w-6 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Location</h4>
                          <p className="text-sm text-muted-foreground">{clubSettings.meetingLocation}</p>
                        </div>
                      </div>
                    )}
                    {clubSettings?.meetingSchedule && (
                      <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                        <CalendarIcon className="h-6 w-6 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Schedule</h4>
                          <p className="text-sm text-muted-foreground">{clubSettings.meetingSchedule}</p>
                        </div>
                      </div>
                    )}
                    {clubSettings?.officeHours && (
                      <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                        <Clock className="h-6 w-6 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Office Hours</h4>
                          <p className="text-sm text-muted-foreground">{clubSettings.officeHours}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
