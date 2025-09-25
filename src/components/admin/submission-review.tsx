'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Eye, Calendar, User, Code, Trophy, FileText, Link2, ExternalLink } from 'lucide-react';
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

  // Helper function to get submission type info
  const getSubmissionTypeInfo = (submission: Submission) => {
    const submissionType = submission.submissionType || 'code'; // Default to 'code' for backward compatibility
    
    switch (submissionType) {
      case 'file':
        const fileCount = submission.fileNames?.length || (submission.fileName ? 1 : 0);
        return { 
          icon: <FileText className="h-4 w-4" />, 
          label: 'File Upload',
          detail: fileCount > 1 ? `${fileCount} files` : (submission.fileName || submission.fileNames?.[0] || 'Uploaded file')
        };
      case 'link':
        return { 
          icon: <Link2 className="h-4 w-4" />, 
          label: 'Project Link',
          detail: submission.platformType || 'Online IDE'
        };
      default:
        return { 
          icon: <Code className="h-4 w-4" />, 
          label: 'Code Submission',
          detail: submission.language
        };
    }
  };

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
                const typeInfo = getSubmissionTypeInfo(submission);
                
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
                            {typeInfo.icon}
                            {typeInfo.label}
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
                      {submission.submissionType === 'link' && submission.projectUrl ? (
                        <div>
                          <Label>Project URL ({submission.platformType}):</Label>
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <a 
                              href={submission.projectUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 text-sm"
                            >
                              {submission.projectUrl}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      ) : submission.submissionType === 'file' ? (
                        <div>
                          {/* Multiple files display */}
                          {submission.fileNames && submission.fileNames.length > 0 ? (
                            <div>
                              <Label>Uploaded Files ({submission.fileNames.length}):</Label>
                              <div className="space-y-1 mb-2">
                                {submission.fileNames.map((fileName, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-3 w-3" />
                                    {fileName}
                                  </div>
                                ))}
                              </div>
                              <pre className="bg-muted p-3 rounded-md text-sm max-h-40 overflow-y-auto">
                                {submission.code}
                              </pre>
                            </div>
                          ) : (
                            /* Legacy single file display */
                            <div>
                              <Label>Uploaded File: {submission.fileName}</Label>
                              <pre className="bg-muted p-3 rounded-md text-sm max-h-40 overflow-y-auto">
                                {submission.code}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <Label>Submitted Code:</Label>
                          <pre className="bg-muted p-3 rounded-md text-sm max-h-40 overflow-y-auto">
                            {submission.code}
                          </pre>
                        </div>
                      )}
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
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader className="mb-4 border-b pb-3">
            <DialogTitle>Review Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="flex-1 overflow-y-auto pr-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <Label className="font-semibold mb-1">Challenge:</Label>
                  <p className="text-muted-foreground">{challengeMap[selectedSubmission.challengeId]?.title || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="font-semibold mb-1">Points:</Label>
                  <p className="text-muted-foreground">{selectedSubmission.points}</p>
                </div>
                <div>
                  <Label className="font-semibold mb-1">Language:</Label>
                  <p className="text-muted-foreground">{selectedSubmission.language}</p>
                </div>
                <div>
                  <Label className="font-semibold mb-1">Submitted:</Label>
                  <p className="text-muted-foreground">{format(selectedSubmission.submittedAt.toDate(), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold mb-2">Problem Statement:</Label>
                <div className="bg-muted p-3 rounded-md text-sm max-h-32 overflow-y-auto">
                  {challengeMap[selectedSubmission.challengeId]?.prompt || 'No prompt available'}
                </div>
              </div>

              <div className="space-y-2">
                {selectedSubmission.submissionType === 'link' && selectedSubmission.projectUrl ? (
                    <div>
                    <Label className="font-semibold mb-2">Project URL ({selectedSubmission.platformType}):</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <a 
                        href={selectedSubmission.projectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {selectedSubmission.projectUrl}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                      {selectedSubmission.code && selectedSubmission.code !== `Project URL: ${selectedSubmission.projectUrl}` && (
                      <div className="mt-3">
                        <Label className="font-semibold mb-2">Additional Notes:</Label>
                        <pre className="bg-muted p-3 rounded-md text-sm max-h-40 overflow-y-auto font-mono">
                          {selectedSubmission.code}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : selectedSubmission.submissionType === 'file' ? (
                  <div>
                    {/* Multiple files display */}
                    {selectedSubmission.fileNames && selectedSubmission.fileNames.length > 0 ? (
                      <div>
                        <Label className="font-semibold mb-2">Uploaded Files ({selectedSubmission.fileNames.length}):</Label>
                        <div className="space-y-1 mb-3">
                          {selectedSubmission.fileNames.map((fileName, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm bg-secondary/50 px-2 py-1 rounded">
                              <FileText className="h-3 w-3" />
                              {fileName}
                            </div>
                          ))}
                        </div>
                        <Label className="font-semibold mb-2">Combined Content:</Label>
                        <pre className="bg-muted p-3 rounded-md text-sm max-h-80 overflow-y-auto font-mono">
                          {selectedSubmission.code}
                        </pre>
                      </div>
                    ) : (
                      /* Legacy single file display */
                      <div>
                        <Label className="font-semibold mb-2">Uploaded File: {selectedSubmission.fileName}</Label>
                        <pre className="bg-muted p-3 rounded-md text-sm max-h-80 overflow-y-auto font-mono">
                          {selectedSubmission.code}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Label className="font-semibold mb-2">Submitted Code:</Label>
                    <pre className="bg-muted p-3 rounded-md text-sm max-h-80 overflow-y-auto font-mono">
                      {selectedSubmission.code}
                    </pre>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback" className="font-semibold mb-2">Feedback (Optional):</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback for the student..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
          {selectedSubmission && (
            <div className="flex justify-end gap-2 py-3 border-t">
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
