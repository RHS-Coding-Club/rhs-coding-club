'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PendingMember } from '@/lib/firebase-collections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { brevoService } from '@/lib/brevo';
import { Check, X } from 'lucide-react';

export function PendingMemberManagement() {
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchPendingMembers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'pendingMembers'));
      const members = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as PendingMember))
        .filter(member => member.status === 'pending');
      setPendingMembers(members);
    } catch (error) {
      console.error('Error fetching pending members:', error);
      toast.error('Failed to fetch pending members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingMembers();
  }, []);

  const handleApprove = async (member: PendingMember) => {
    setUpdating(member.id);
    try {
      const batch = writeBatch(db);

      // 1. Create a new user document
      const newUserRef = doc(collection(db, 'users'));
      batch.set(newUserRef, {
        name: member.name,
        email: member.email,
        role: 'member',
        createdAt: serverTimestamp(),
        // You might want to add other default fields here
      });

      // 2. Update the pending member status
      const pendingMemberRef = doc(db, 'pendingMembers', member.id);
      batch.update(pendingMemberRef, { status: 'approved' });

      await batch.commit();

      // 3. Send welcome email
      await brevoService.sendWelcomeEmail(member.email, member.name);
      
      toast.success(`${member.name} has been approved as a member.`);
      fetchPendingMembers(); // Refresh the list
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error('Failed to approve member.');
    } finally {
      setUpdating(null);
    }
  };

  const handleReject = async (memberId: string) => {
    setUpdating(memberId);
    try {
      const pendingMemberRef = doc(db, 'pendingMembers', memberId);
      await updateDoc(pendingMemberRef, { status: 'rejected' });
      toast.info('Membership application has been rejected.');
      fetchPendingMembers(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting member:', error);
      toast.error('Failed to reject member.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Membership Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading applications...</p>
        ) : pendingMembers.length === 0 ? (
          <p>No pending applications.</p>
        ) : (
          <div className="space-y-4">
            {pendingMembers.map(member => (
              <div key={member.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold">{member.name}</p>
                  <p>{member.email}</p>
                  <p className="text-sm text-muted-foreground">Grade: {member.grade}</p>
                  <p className="text-sm text-muted-foreground">Interests: {member.interests}</p>
                  <p className="text-sm text-muted-foreground">Experience: {member.experience}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove(member)}
                    disabled={updating === member.id}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(member.id)}
                    disabled={updating === member.id}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
