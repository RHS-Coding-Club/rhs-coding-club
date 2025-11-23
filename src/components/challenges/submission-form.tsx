'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const SANDBOX_ENVIRONMENTS = [
  { value: 'codesandbox', label: 'CodeSandbox' },
  { value: 'stackblitz', label: 'StackBlitz' },
  { value: 'replit', label: 'Repl.it' },
  { value: 'codepen', label: 'CodePen' },
  { value: 'jsfiddle', label: 'JSFiddle' },
  { value: 'glitch', label: 'Glitch' },
  { value: 'github', label: 'GitHub Repository' },
  { value: 'other', label: 'Other' }
];

export function SubmissionForm({ challenge, existingSubmission, onSubmissionSuccess }: SubmissionFormProps) {
  const { userProfile } = useAuth();
  
  // Form state
  const [language, setLanguage] = useState(existingSubmission?.language || '');
  const [projectUrl, setProjectUrl] = useState(existingSubmission?.projectUrl || '');
  const [sandboxEnvironment, setSandboxEnvironment] = useState(existingSubmission?.platformType || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateSubmission = () => {
    if (!userProfile) {
      toast.error('You must be logged in to submit a solution');
      return false;
    }

    if (!language) {
      toast.error('Please select a programming language');
      return false;
    }

    if (!projectUrl.trim()) {
      toast.error('Please enter a project URL');
      return false;
    }

    if (!sandboxEnvironment) {
      toast.error('Please select a sandbox environment');
      return false;
    }

    // Basic URL validation
    try {
      new URL(projectUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSubmission()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData: Omit<Submission, 'id' | 'submittedAt'> = {
        challengeId: challenge.id,
        userId: userProfile!.uid,
        code: `Project URL: ${projectUrl}`,
        language,
        points: challenge.points,
        status: 'pending' as const,
        submissionType: 'link',
        projectUrl,
        platformType: sandboxEnvironment,
      };

      await challengesService.submitSolution(submissionData);

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
          {/* Programming Language Selection */}
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

          {/* Sandbox Environment Selection */}
          <div className="space-y-2">
            <Label htmlFor="sandbox-environment">Sandbox Environment</Label>
            <Select value={sandboxEnvironment} onValueChange={setSandboxEnvironment}>
              <SelectTrigger>
                <SelectValue placeholder="Select your sandbox environment" />
              </SelectTrigger>
              <SelectContent>
                {SANDBOX_ENVIRONMENTS.map((env) => (
                  <SelectItem key={env.value} value={env.value}>
                    {env.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the coding sandbox platform you&apos;re using for your project. 
            </p>
          </div>

          {/* Project URL */}
          <div className="space-y-2">
            <Label htmlFor="project-url">Project URL</Label>
            <Input
              id="project-url"
              type="url"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://codesandbox.io/s/your-project or https://github.com/username/repo-name"
            />
            <p className="text-xs text-muted-foreground">
              Share a link to your project. Make sure the project is publicly accessible.
            </p>
          </div>

          {existingSubmission?.projectUrl && (
            <div className="p-3 bg-muted rounded-md">
              <Label className="text-sm font-medium">Current Project URL:</Label>
              <p className="text-sm mt-1">
                <a 
                  href={existingSubmission.projectUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {existingSubmission.projectUrl}
                </a>
              </p>
            </div>
          )}

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
