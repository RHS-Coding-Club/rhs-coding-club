'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type UserRole = 'admin' | 'officer' | 'member' | 'guest';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date | null;
  lastLoginAt: Date | null;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to remove undefined values from objects before saving to Firestore
  const cleanObject = (obj: Record<string, unknown>): Record<string, unknown> => {
    const cleaned: Record<string, unknown> = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        cleaned[key] = obj[key];
      }
    });
    return cleaned;
  };

  const createUserProfile = useCallback(async (user: User, additionalData?: Record<string, unknown>) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const { displayName, email, photoURL } = user;
      
      // Create profile object, excluding undefined values
      const profileData = {
        email: email || '',
        displayName: displayName || email?.split('@')[0] || 'Anonymous',
        photoURL: photoURL || null, // Use null instead of undefined
        role: 'guest' as UserRole, // Default role
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        ...additionalData,
      };

      // Clean the object to remove any undefined values
      const profile = cleanObject(profileData);

      try {
        await setDoc(userDocRef, profile);
        return { uid: user.uid, ...profile } as UserProfile;
      } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }
    } else {
      // Update last login time
      await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      return { uid: user.uid, ...userDoc.data() } as UserProfile;
    }
  }, []);

  const fetchUserProfile = useCallback(async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const profile = { uid: user.uid, ...userDoc.data() } as UserProfile;
        setUserProfile(profile);
      } else {
        // Create profile if it doesn't exist
        const profile = await createUserProfile(user);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [createUserProfile]);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(result.user, { displayName });
      
      // Create user profile in Firestore
      await createUserProfile(result.user, { displayName });
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!userProfile) return false;
    return roles.includes(userProfile.role);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserProfile(user);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchUserProfile]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
