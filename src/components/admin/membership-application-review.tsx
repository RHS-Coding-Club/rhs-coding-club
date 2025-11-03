'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, Loader2, Clock, UserCheck, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MembershipApplication {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  grade: string;
  experience: string;
  programmingLanguages: string[];
  interests: string[];
  goals: string;
  whyJoin: string;
  availability: string;
  githubUsername: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp;
}

const interestLabels: Record<string, string> = {
  web: 'Web Development',
  mobile: 'Mobile Development',
  game: 'Game Development',
  ai: 'AI/Machine Learning',
  data: 'Data Science',
  cybersecurity: 'Cybersecurity',
  cloud: 'Cloud Computing',
  blockchain: 'Blockchain',
  iot: 'IoT',
  design: 'UI/UX Design',
};

export function MembershipApplicationReview() {
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<MembershipApplication | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const fetchApplications = async () => {
    try {
      const q = query(collection(db, 'membershipApplications'), orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);
      const apps = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MembershipApplication[];
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (application: MembershipApplication) => {
    setProcessingId(application.id);
    try {
      // Update application status
      await updateDoc(doc(db, 'membershipApplications', application.id), {
        status: 'approved',
        approvedAt: new Date(),
      });

      // Update user role to member
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userDoc = usersSnapshot.docs.find((doc) => doc.data().email === application.email);
      
      if (userDoc) {
        await updateDoc(doc(db, 'users', userDoc.id), {
          role: 'member',
        });
      }

      toast.success(`Approved ${application.displayName}'s application`);
      fetchApplications();
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (application: MembershipApplication) => {
    setProcessingId(application.id);
    try {
      await updateDoc(doc(db, 'membershipApplications', application.id), {
        status: 'rejected',
        rejectedAt: new Date(),
      });

      toast.success(`Rejected ${application.displayName}'s application`);
      fetchApplications();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    setProcessingId(applicationId);
    try {
      await deleteDoc(doc(db, 'membershipApplications', applicationId));
      toast.success('Application deleted');
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    } finally {
      setProcessingId(null);
    }
  };

  const viewDetails = (application: MembershipApplication) => {
    setSelectedApplication(application);
    setIsDetailDialogOpen(true);
  };

  const pendingApplications = applications.filter((app) => app.status === 'pending');
  const reviewedApplications = applications.filter((app) => app.status !== 'pending');

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Applications
            <Badge variant="secondary">{pendingApplications.length}</Badge>
          </CardTitle>
          <CardDescription>Review and approve membership applications</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApplications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending applications</p>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <Card key={application.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{application.displayName}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Mail className="h-4 w-4" />
                            {application.email}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Grade {application.grade}</Badge>
                          {application.experience && (
                            <Badge variant="outline" className="capitalize">
                              {application.experience}
                            </Badge>
                          )}
                          {application.githubUsername && (
                            <Badge variant="outline">@{application.githubUsername}</Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          {application.interests.length > 0 && (
                            <div>
                              <p className="text-sm font-medium">Interests:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {application.interests.map((interest) => (
                                  <Badge key={interest} variant="secondary" className="text-xs">
                                    {interestLabels[interest] || interest}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Submitted{' '}
                          {application.submittedAt &&
                            formatDistanceToNow(
                              application.submittedAt.toDate ? application.submittedAt.toDate() : new Date(),
                              { addSuffix: true }
                            )}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewDetails(application)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(application)}
                          disabled={processingId === application.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(application)}
                          disabled={processingId === application.id}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Reviewed Applications
            <Badge variant="secondary">{reviewedApplications.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewedApplications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No reviewed applications yet</p>
          ) : (
            <div className="space-y-3">
              {reviewedApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{application.displayName}</p>
                    <p className="text-sm text-muted-foreground">{application.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={application.status === 'approved' ? 'default' : 'destructive'}
                    >
                      {application.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => viewDetails(application)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(application.id)}
                      disabled={processingId === application.id}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Full application for {selectedApplication?.displayName}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{selectedApplication.displayName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedApplication.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Grade</p>
                  <p className="text-sm">{selectedApplication.grade}th Grade</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Experience</p>
                  <p className="text-sm capitalize">{selectedApplication.experience || 'Not specified'}</p>
                </div>
              </div>

              {selectedApplication.programmingLanguages.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Programming Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.programmingLanguages.map((lang) => (
                      <Badge key={lang} variant="secondary">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedApplication.interests.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Areas of Interest</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interestLabels[interest] || interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedApplication.goals && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Goals</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedApplication.goals}</p>
                </div>
              )}

              {selectedApplication.whyJoin && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Why Join</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedApplication.whyJoin}</p>
                </div>
              )}

              {selectedApplication.availability && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Availability</p>
                  <p className="text-sm">{selectedApplication.availability}</p>
                </div>
              )}

              {selectedApplication.githubUsername && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">GitHub</p>
                  <a
                    href={`https://github.com/${selectedApplication.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    @{selectedApplication.githubUsername}
                  </a>
                </div>
              )}

              {selectedApplication.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleApprove(selectedApplication);
                      setIsDetailDialogOpen(false);
                    }}
                    disabled={processingId === selectedApplication.id}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedApplication);
                      setIsDetailDialogOpen(false);
                    }}
                    disabled={processingId === selectedApplication.id}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
