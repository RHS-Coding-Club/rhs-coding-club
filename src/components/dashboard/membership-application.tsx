'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/auth-context';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, UserPlus } from 'lucide-react';

const programmingLanguages = [
  'JavaScript/TypeScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
  'Ruby',
  'PHP',
  'Other',
];

const interestAreas = [
  { id: 'web', label: 'Web Development' },
  { id: 'mobile', label: 'Mobile Development' },
  { id: 'game', label: 'Game Development' },
  { id: 'ai', label: 'AI/Machine Learning' },
  { id: 'data', label: 'Data Science' },
  { id: 'cybersecurity', label: 'Cybersecurity' },
  { id: 'cloud', label: 'Cloud Computing' },
  { id: 'blockchain', label: 'Blockchain' },
  { id: 'iot', label: 'IoT' },
  { id: 'design', label: 'UI/UX Design' },
];

interface MembershipApplicationProps {
  onSuccess?: () => void;
}

export function MembershipApplication({ onSuccess }: MembershipApplicationProps) {
  const { user, userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    grade: '',
    experience: '',
    programmingLanguages: [] as string[],
    interests: [] as string[],
    goals: '',
    whyJoin: '',
    availability: '',
    githubUsername: '',
  });

  const handleCheckboxChange = (field: 'programmingLanguages' | 'interests', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be signed in to apply for membership.');
      return;
    }

    if (!formData.grade || formData.interests.length === 0) {
      toast.error('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user already has a pending application
      const existingApplicationQuery = query(
        collection(db, 'membershipApplications'),
        where('userId', '==', user.uid)
      );
      const existingApplicationSnapshot = await getDocs(existingApplicationQuery);

      if (!existingApplicationSnapshot.empty) {
        toast.error('You already have a pending membership application.');
        setIsSubmitting(false);
        return;
      }

      // Submit application
      await addDoc(collection(db, 'membershipApplications'), {
        userId: user.uid,
        email: user.email,
        displayName: userProfile?.displayName || user.displayName || 'Unknown',
        grade: formData.grade,
        experience: formData.experience,
        programmingLanguages: formData.programmingLanguages,
        interests: formData.interests,
        goals: formData.goals,
        whyJoin: formData.whyJoin,
        availability: formData.availability,
        githubUsername: formData.githubUsername,
        status: 'pending',
        submittedAt: serverTimestamp(),
      });

      toast.success('Application submitted successfully!');
      setIsSubmitted(true);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1,
                }}
                className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-2"
              >
                <h3 className="text-xl font-semibold text-foreground">Application Submitted!</h3>
                <p className="text-muted-foreground">
                  Thank you for applying to join RHS Coding Club. We&apos;ll review your application and get back to you
                  soon.
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Apply for Membership</CardTitle>
            <CardDescription>
              Tell us about yourself and your interest in coding
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grade */}
          <div className="space-y-2">
            <Label htmlFor="grade">
              Grade Level <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
              <SelectTrigger id="grade">
                <SelectValue placeholder="Select your grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9">9th Grade</SelectItem>
                <SelectItem value="10">10th Grade</SelectItem>
                <SelectItem value="11">11th Grade</SelectItem>
                <SelectItem value="12">12th Grade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Programming Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience">Programming Experience Level</Label>
            <Select
              value={formData.experience}
              onValueChange={(value) => setFormData({ ...formData, experience: value })}
            >
              <SelectTrigger id="experience">
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Experience</SelectItem>
                <SelectItem value="beginner">Beginner (Less than 1 year)</SelectItem>
                <SelectItem value="intermediate">Intermediate (1-2 years)</SelectItem>
                <SelectItem value="advanced">Advanced (2+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Programming Languages */}
          <div className="space-y-3">
            <Label>Programming Languages (if any)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {programmingLanguages.map((lang) => (
                <div key={lang} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${lang}`}
                    checked={formData.programmingLanguages.includes(lang)}
                    onCheckedChange={() => handleCheckboxChange('programmingLanguages', lang)}
                  />
                  <Label htmlFor={`lang-${lang}`} className="text-sm font-normal cursor-pointer">
                    {lang}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Areas of Interest */}
          <div className="space-y-3">
            <Label>
              Areas of Interest <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {interestAreas.map((area) => (
                <div key={area.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`interest-${area.id}`}
                    checked={formData.interests.includes(area.id)}
                    onCheckedChange={() => handleCheckboxChange('interests', area.id)}
                  />
                  <Label htmlFor={`interest-${area.id}`} className="text-sm font-normal cursor-pointer">
                    {area.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <Label htmlFor="goals">What do you hope to learn or achieve?</Label>
            <Textarea
              id="goals"
              placeholder="Tell us about your goals and what you want to accomplish in the coding club"
              className="min-h-[100px]"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
            />
          </div>

          {/* Why Join */}
          <div className="space-y-2">
            <Label htmlFor="whyJoin">Why do you want to join RHS Coding Club?</Label>
            <Textarea
              id="whyJoin"
              placeholder="Share what motivates you to join our community"
              className="min-h-[100px]"
              value={formData.whyJoin}
              onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
            />
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <Label htmlFor="availability">Availability for Weekly Meetings</Label>
            <Input
              id="availability"
              placeholder="e.g., Every Thursday 12:17 PM - 12:56 PM"
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Our regular meetings are every Thursday from 12:17 PM to 12:56 PM
            </p>
          </div>

          {/* GitHub Username */}
          <div className="space-y-2">
            <Label htmlFor="githubUsername">GitHub Username (optional)</Label>
            <Input
              id="githubUsername"
              placeholder="Your GitHub username"
              value={formData.githubUsername}
              onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
