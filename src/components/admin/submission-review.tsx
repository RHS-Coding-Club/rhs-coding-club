'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Eye, Calendar, User, Code, Trophy } from 'lucide-react';
import { challengesService } from '@/lib/services/challenges';
import { usePendingSubmissions, useChallenges } from '@/hooks/useChallenges';
import { useAuth } from '@/contexts/auth-context';
import { Submission, Challenge } from '@/lib/firebase-collections';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function SubmissionReview() {
  const { userProfile } = useAuth();
  const { submissions, loading, refetch } = usePendingSubmissions();
  const { challenges } = useChallenges();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  // Create a map of challenge ID to challenge for easy lookup
  const challengeMap = challenges.reduce((acc, challenge) => {
    acc[challenge.id] = challenge;
    return acc;
  }, {} as Record<string, Challenge>);

  const handleReview = async (submissionId: string, status: 'pass' | 'fail') => {
    if (!userProfile) {
      toast.error('You must be logged in');
      return;
    }

    setIsReviewing(true);

    try {
      await challengesService.reviewSubmission(
        submissionId,
        status,
        userProfile.uid,
        feedback.trim() || undefined
      );
      
      toast.success(`Submission marked as ${status.toUpperCase()}`);
      setSelectedSubmission(null);
      setFeedback('');
      refetch();
    } catch (error) {
      console.error('Error reviewing submission:', error);
      toast.error('Failed to review submission');
    } finally {
      setIsReviewing(false);
    }
  };

  const openReviewDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setFeedback('');
  };

  const closeReviewDialog = () => {
    setSelectedSubmission(null);
    setFeedback('');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center">Loading pending submissions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Pending Submissions ({submissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No pending submissions to review.
              </p>
            ) : (
              submissions.map((submission) => {
                const challenge = challengeMap[submission.challengeId];
                return (
                  <div key={submission.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">
                          {challenge?.title || 'Unknown Challenge'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            User ID: {submission.userId}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(submission.submittedAt.toDate(), 'MMM d, yyyy h:mm a')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Code className="h-4 w-4" />
                            {submission.language}
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            {submission.points} points
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Submitted Code:</Label>
                      <pre className="bg-muted p-3 rounded-md text-sm max-h-40 overflow-y-auto">
                        {submission.code}
                      </pre>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReviewDialog(submission)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && closeReviewDialog()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Challenge:</Label>
                  <p>{challengeMap[selectedSubmission.challengeId]?.title || 'Unknown'}</p>
                </div>
                <div>
                  <Label>Language:</Label>
                  <p>{selectedSubmission.language}</p>
                </div>
                <div>
                  <Label>Points:</Label>
                  <p>{selectedSubmission.points}</p>
                </div>
                <div>
                  <Label>Submitted:</Label>
                  <p>{format(selectedSubmission.submittedAt.toDate(), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Problem Statement:</Label>
                <div className="bg-muted p-3 rounded-md text-sm max-h-40 overflow-y-auto">
                  {challengeMap[selectedSubmission.challengeId]?.prompt || 'No prompt available'}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Submitted Code:</Label>
                <pre className="bg-muted p-3 rounded-md text-sm max-h-60 overflow-y-auto font-mono">
                  {selectedSubmission.code}
                </pre>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback (Optional):</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback for the student..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={closeReviewDialog}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReview(selectedSubmission.id, 'fail')}
                  disabled={isReviewing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Fail
                </Button>
                <Button
                  onClick={() => handleReview(selectedSubmission.id, 'pass')}
                  disabled={isReviewing}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Pass
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
