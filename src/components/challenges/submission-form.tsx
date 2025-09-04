'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { challengesService } from '@/lib/services/challenges';
import { useAuth } from '@/contexts/auth-context';
import { Challenge, Submission } from '@/lib/firebase-collections';
import { toast } from 'sonner';

interface SubmissionFormProps {
  challenge: Challenge;
  existingSubmission?: Submission | null;
  onSubmissionSuccess: () => void;
}

const PROGRAMMING_LANGUAGES = [
  'python',
  'javascript',
  'typescript',
  'java',
  'cpp',
  'c',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
  'kotlin',
  'swift',
  'other'
];

export function SubmissionForm({ challenge, existingSubmission, onSubmissionSuccess }: SubmissionFormProps) {
  const { userProfile } = useAuth();
  const [code, setCode] = useState(existingSubmission?.code || '');
  const [language, setLanguage] = useState(existingSubmission?.language || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      toast.error('You must be logged in to submit a solution');
      return;
    }

    if (!code.trim()) {
      toast.error('Please enter your code solution');
      return;
    }

    if (!language) {
      toast.error('Please select a programming language');
      return;
    }

    setIsSubmitting(true);

    try {
      await challengesService.submitSolution({
        challengeId: challenge.id,
        userId: userProfile.uid,
        code,
        language,
        points: challenge.points,
        status: 'pending' as const,
      });

      toast.success('Solution submitted successfully! It will be reviewed by an officer.');
      onSubmissionSuccess();
    } catch (error) {
      console.error('Error submitting solution:', error);
      toast.error('Failed to submit solution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    if (!existingSubmission) return null;
    
    switch (existingSubmission.status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-500">Passed</Badge>;
      case 'fail':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Under Review</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Submit Your Solution</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Programming Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select a programming language" />
              </SelectTrigger>
              <SelectContent>
                {PROGRAMMING_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Your Solution</Label>
            <Textarea
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code solution here..."
              className="min-h-[300px] font-mono text-sm"
              required
            />
          </div>

          {existingSubmission?.feedback && (
            <div className="space-y-2">
              <Label>Feedback from Officer</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">{existingSubmission.feedback}</p>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : existingSubmission ? 'Update Submission' : 'Submit Solution'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
