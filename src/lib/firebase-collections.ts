import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'officer' | 'admin';
  avatar?: string;
  bio?: string;
  gradYear?: number;
  skills?: string[];
  badges?: string[];
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
  prompt: string;
  difficulty: 'easy' | 'medium' | 'hard';
  samples?: string[];
  points: number;
  weekNo: number;
  published: boolean;
}

export interface Submission {
  id: string;
  challengeId: string;
  userId: string;
  code: string;
  result?: any;
  score?: number;
}

export interface Post {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags?: string[];
  published: boolean;
  authorId: string; // User ID
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

export interface Attendance {
  id: string;
  eventId: string;
  userId: string;
  present: boolean;
}
