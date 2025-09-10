import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Challenge, Submission, User } from '@/lib/firebase-collections';

export const challengesService = {
  // Get all published challenges
  async getAllChallenges(): Promise<Challenge[]> {
    const challengesRef = collection(db, 'challenges');
    const q = query(
      challengesRef,
      where('published', '==', true),
      orderBy('weekNo', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Challenge);
  },

  // Get challenge by ID
  async getChallengeById(id: string): Promise<Challenge | null> {
    const challengeRef = doc(db, 'challenges', id);
    const snapshot = await getDoc(challengeRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Challenge;
    }
    return null;
  },

  // Create a new challenge (admin/officer only)
  async createChallenge(challengeData: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const challengesRef = collection(db, 'challenges');
    const docRef = await addDoc(challengesRef, {
      ...challengeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Update challenge (admin/officer only)
  async updateChallenge(id: string, updates: Partial<Challenge>): Promise<void> {
    const challengeRef = doc(db, 'challenges', id);
    await updateDoc(challengeRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete challenge (admin/officer only)
  async deleteChallenge(id: string): Promise<void> {
    const challengeRef = doc(db, 'challenges', id);
    await deleteDoc(challengeRef);
  },

  // Get submissions for a challenge
  async getSubmissionsForChallenge(challengeId: string): Promise<Submission[]> {
    const submissionsRef = collection(db, 'submissions');
    const q = query(
      submissionsRef,
      where('challengeId', '==', challengeId),
      orderBy('submittedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Submission);
  },

  // Get user's submission for a challenge
  async getUserSubmission(challengeId: string, userId: string): Promise<Submission | null> {
    const submissionsRef = collection(db, 'submissions');
    const q = query(
      submissionsRef,
      where('challengeId', '==', challengeId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Submission;
    }
    return null;
  },

  // Submit solution
  async submitSolution(submissionData: Omit<Submission, 'id' | 'submittedAt'>): Promise<string> {
    const submissionsRef = collection(db, 'submissions');
    
    // Check if user already has a submission
    const existingSubmission = await this.getUserSubmission(submissionData.challengeId, submissionData.userId);
    
    if (existingSubmission) {
      // Update existing submission
      const submissionRef = doc(db, 'submissions', existingSubmission.id);
      await updateDoc(submissionRef, {
        code: submissionData.code,
        language: submissionData.language,
        status: 'pending',
        submittedAt: serverTimestamp(),
      });
      return existingSubmission.id;
    } else {
      // Create new submission
      const docRef = await addDoc(submissionsRef, {
        ...submissionData,
        status: 'pending',
        submittedAt: serverTimestamp(),
      });
      return docRef.id;
    }
  },

  // Review submission (officer/admin only)
  async reviewSubmission(
    submissionId: string, 
    status: 'pass' | 'fail', 
    reviewerId: string,
    feedback?: string
  ): Promise<void> {
    return runTransaction(db, async (transaction) => {
      // READ PHASE - All reads must happen first
      const submissionRef = doc(db, 'submissions', submissionId);
      const submissionDoc = await transaction.get(submissionRef);
      
      if (!submissionDoc.exists()) {
        throw new Error('Submission not found');
      }
      
      const submission = submissionDoc.data() as Submission;
      
      // Get user document for point updates
      const userRef = doc(db, 'users', submission.userId);
      const userDoc = await transaction.get(userRef);
      
      // WRITE PHASE - All writes must happen after reads
      
      // Update submission
      transaction.update(submissionRef, {
        status,
        reviewedAt: serverTimestamp(),
        reviewedBy: reviewerId,
        feedback: feedback || null,
      });
      
      // Handle point updates if user exists
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const currentPoints = userData.points || 0;
        
        // If status is 'pass' and submission wasn't already passed, award points
        if (status === 'pass' && submission.status !== 'pass') {
          transaction.update(userRef, {
            points: currentPoints + submission.points,
            lastPointUpdate: serverTimestamp()
          });
        }
        
        // If changing from 'pass' to 'fail', deduct points
        if (status === 'fail' && submission.status === 'pass') {
          transaction.update(userRef, {
            points: Math.max(0, currentPoints - submission.points),
            lastPointUpdate: serverTimestamp()
          });
        }
      }
    });
  },

  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('points', '>', 0),
      orderBy('points', 'desc'),
      orderBy('lastPointUpdate', 'asc')
    );
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User);
    return limit > 0 ? users.slice(0, limit) : users;
  },

  // Get user's submissions
  async getUserSubmissions(userId: string): Promise<Submission[]> {
    const submissionsRef = collection(db, 'submissions');
    const q = query(
      submissionsRef,
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Submission);
  },

  // Get all pending submissions (for officer/admin review)
  async getPendingSubmissions(): Promise<Submission[]> {
    const submissionsRef = collection(db, 'submissions');
    const q = query(
      submissionsRef,
      where('status', '==', 'pending'),
      orderBy('submittedAt', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Submission);
  }
};
