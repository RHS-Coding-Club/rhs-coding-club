import { Timestamp } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { db } from './firebase';


export interface User {
  id: string;
  displayName: string;
  name?: string; // Keep as optional for backward compatibility
  email: string;
  role: 'member' | 'officer' | 'admin';
  avatar?: string;
  photoURL?: string;
  bio?: string;
  gradYear?: number;
  skills?: string[];
  badges?: string[];
  points?: number;
  lastPointUpdate?: Timestamp;
}

export interface Officer {
  id: string;
  name: string;
  role: string; // Position like "President", "Vice President", etc.
  bio: string;
  email: string;
  githubUrl?: string;
  imageUrl?: string;
  order: number; // For sorting display order
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  location: string;
  tags?: string[];
  coverImage?: string;
  createdBy: string; // User ID
}

export interface Rsvp {
  eventId: string;
  userId: string;
  status: 'YES' | 'NO' | 'MAYBE';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  repoUrl?: string;
  demoUrl?: string;
  images?: string[];
  authorId: string; // User ID
  featured?: boolean;
  approved: boolean;
  year?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  prompt: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sampleInput?: string;
  sampleOutput?: string;
  points: number;
  weekNo: number;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User ID
}

export interface Submission {
  id: string;
  challengeId: string;
  userId: string;
  code: string;
  language: string;
  status: 'pending' | 'pass' | 'fail';
  points: number;
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string; // Officer/Admin user ID
  feedback?: string;
}

export interface Post {
  id: string;
  title: string;
  summary: string;
  content: string; // markdown content
  tags?: string[];
  author: string; // Author name
  authorId: string; // User ID
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  slug?: string; // URL-friendly version of title
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  addedBy: string; // User ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Timestamp;
}

export interface PendingMember {
  id: string;
  name: string;
  email: string;
  grade: string;
  experience: string;
  interests: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp;
}

export interface Attendance {
  id: string;
  eventId: string;
  userId: string;
  present: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: Timestamp;
}

export const newsletterSubscribersCollection = collection(db, 'newsletterSubscribers');