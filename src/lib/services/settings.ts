import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ==================== CLUB INFORMATION SETTINGS ====================

// Club Information Settings Interface
export interface ClubSettings {
  id: string;
  clubName: string;
  tagline: string;
  description: string;
  missionStatement: string;
  contactEmail: string;
  secondaryEmail?: string;
  meetingLocation: string;
  meetingSchedule: string;
  officeHours?: string;
  updatedAt: Timestamp;
  updatedBy: string; // Admin user ID
}

// Default club settings
const DEFAULT_CLUB_SETTINGS: Omit<ClubSettings, 'id' | 'updatedAt' | 'updatedBy'> = {
  clubName: 'RHS Coding Club',
  tagline: 'Learn Programming & Build Projects',
  description: 'Join the RHS Coding Club - Learn programming, participate in challenges, build projects, and connect with fellow developers. Open to all skill levels.',
  missionStatement: 'To foster a community of passionate developers, provide learning opportunities, and empower students to build innovative projects.',
  contactEmail: 'rhscodingclub@example.com',
  secondaryEmail: '',
  meetingLocation: 'Room TBD',
  meetingSchedule: 'Every Tuesday and Thursday, 3:30 PM - 5:00 PM',
  officeHours: 'After school, by appointment',
};

/**
 * Get club information settings from Firestore
 */
export async function getClubSettings(): Promise<ClubSettings | null> {
  try {
    const settingsRef = doc(db, 'settings', 'club-info');
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      return {
        id: settingsDoc.id,
        ...settingsDoc.data(),
      } as ClubSettings;
    }

    return null;
  } catch (error) {
    console.error('Error fetching club settings:', error);
    throw error;
  }
}

/**
 * Update or create club information settings
 */
export async function updateClubSettings(
  settings: Partial<Omit<ClubSettings, 'id' | 'updatedAt' | 'updatedBy'>>,
  userId: string
): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'club-info');
    
    const updatedSettings = {
      ...settings,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    };

    await setDoc(settingsRef, updatedSettings, { merge: true });
  } catch (error) {
    console.error('Error updating club settings:', error);
    throw error;
  }
}

/**
 * Initialize club settings with default values
 */
export async function initializeClubSettings(userId: string): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'club-info');
    const settingsDoc = await getDoc(settingsRef);

    if (!settingsDoc.exists()) {
      await setDoc(settingsRef, {
        ...DEFAULT_CLUB_SETTINGS,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
      });
    }
  } catch (error) {
    console.error('Error initializing club settings:', error);
    throw error;
  }
}

/**
 * Get club settings or return defaults if not found
 */
export async function getClubSettingsWithDefaults(): Promise<ClubSettings> {
  try {
    const settings = await getClubSettings();
    
    if (settings) {
      return settings;
    }

    // Return defaults if no settings exist
    return {
      id: 'club-info',
      ...DEFAULT_CLUB_SETTINGS,
      updatedAt: Timestamp.now(),
      updatedBy: 'system',
    };
  } catch (error) {
    console.error('Error fetching club settings with defaults:', error);
    // Return defaults on error
    return {
      id: 'club-info',
      ...DEFAULT_CLUB_SETTINGS,
      updatedAt: Timestamp.now(),
      updatedBy: 'system',
    };
  }
}

// ==================== SOCIAL MEDIA SETTINGS ====================

// Social Media Settings Interface
export interface CustomSocialLink {
  name: string;
  url: string;
  icon?: string;
}

export interface SocialMediaSettings {
  id: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  discord?: string;
  github?: string;
  youtube?: string;
  customLinks?: CustomSocialLink[];
  updatedAt: Timestamp;
  updatedBy: string; // Admin user ID
}

// Default social media settings
const DEFAULT_SOCIAL_MEDIA_SETTINGS: Omit<SocialMediaSettings, 'id' | 'updatedAt' | 'updatedBy'> = {
  instagram: '',
  twitter: '',
  linkedin: '',
  discord: 'https://discord.gg/UQR79bn6ZZ',
  github: 'https://github.com/RHS-Coding-Club',
  youtube: '',
  customLinks: [],
};

/**
 * Get social media settings from Firestore
 */
export async function getSocialMediaSettings(): Promise<SocialMediaSettings | null> {
  try {
    const settingsRef = doc(db, 'settings', 'social-media');
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      return {
        id: settingsDoc.id,
        ...settingsDoc.data(),
      } as SocialMediaSettings;
    }

    return null;
  } catch (error) {
    console.error('Error fetching social media settings:', error);
    throw error;
  }
}

/**
 * Update or create social media settings
 */
export async function updateSocialMediaSettings(
  settings: Partial<Omit<SocialMediaSettings, 'id' | 'updatedAt' | 'updatedBy'>>,
  userId: string
): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'social-media');
    
    const updatedSettings = {
      ...settings,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    };

    await setDoc(settingsRef, updatedSettings, { merge: true });
  } catch (error) {
    console.error('Error updating social media settings:', error);
    throw error;
  }
}

/**
 * Initialize social media settings with default values
 */
export async function initializeSocialMediaSettings(userId: string): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'social-media');
    const settingsDoc = await getDoc(settingsRef);

    if (!settingsDoc.exists()) {
      await setDoc(settingsRef, {
        ...DEFAULT_SOCIAL_MEDIA_SETTINGS,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
      });
    }
  } catch (error) {
    console.error('Error initializing social media settings:', error);
    throw error;
  }
}

/**
 * Get social media settings or return defaults if not found
 */
export async function getSocialMediaSettingsWithDefaults(): Promise<SocialMediaSettings> {
  try {
    const settings = await getSocialMediaSettings();
    
    if (settings) {
      return settings;
    }

    // Return defaults if no settings exist
    return {
      id: 'social-media',
      ...DEFAULT_SOCIAL_MEDIA_SETTINGS,
      updatedAt: Timestamp.now(),
      updatedBy: 'system',
    };
  } catch (error) {
    console.error('Error fetching social media settings with defaults:', error);
    // Return defaults on error
    return {
      id: 'social-media',
      ...DEFAULT_SOCIAL_MEDIA_SETTINGS,
      updatedAt: Timestamp.now(),
      updatedBy: 'system',
    };
  }
}

// ==================== POINTS & GAMIFICATION SETTINGS ====================

// Points System Settings Interface
export interface PointsSettings {
  id: string;
  challenges: {
    easy: number;
    medium: number;
    hard: number;
  };
  projectSubmission: number;
  eventAttendance: number;
  leaderboardOptions: {
    displayType: 'weekly' | 'monthly' | 'all-time' | 'all';
    resetSchedule?: string; // cron expression
    showTop?: number; // top N users to display
  };
  updatedAt: Timestamp;
  updatedBy: string; // Admin user ID
}

// Default points settings
const DEFAULT_POINTS_SETTINGS: Omit<PointsSettings, 'id' | 'updatedAt' | 'updatedBy'> = {
  challenges: {
    easy: 50,
    medium: 100,
    hard: 200,
  },
  projectSubmission: 150,
  eventAttendance: 25,
  leaderboardOptions: {
    displayType: 'all',
    showTop: 10,
  },
};

/**
 * Get points system settings from Firestore
 */
export async function getPointsSettings(): Promise<PointsSettings | null> {
  try {
    const settingsRef = doc(db, 'settings', 'points-system');
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      return {
        id: settingsDoc.id,
        ...settingsDoc.data(),
      } as PointsSettings;
    }

    return null;
  } catch (error) {
    console.error('Error fetching points settings:', error);
    throw error;
  }
}

/**
 * Update or create points system settings
 */
export async function updatePointsSettings(
  settings: Partial<Omit<PointsSettings, 'id' | 'updatedAt' | 'updatedBy'>>,
  userId: string
): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'points-system');
    
    const updatedSettings = {
      ...settings,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    };

    await setDoc(settingsRef, updatedSettings, { merge: true });
  } catch (error) {
    console.error('Error updating points settings:', error);
    throw error;
  }
}

/**
 * Initialize points settings with default values
 */
export async function initializePointsSettings(userId: string): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'points-system');
    const settingsDoc = await getDoc(settingsRef);

    if (!settingsDoc.exists()) {
      await setDoc(settingsRef, {
        ...DEFAULT_POINTS_SETTINGS,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
      });
    }
  } catch (error) {
    console.error('Error initializing points settings:', error);
    throw error;
  }
}

/**
 * Get points settings or return defaults if not found
 */
export async function getPointsSettingsWithDefaults(): Promise<PointsSettings> {
  try {
    const settings = await getPointsSettings();
    
    if (settings) {
      return settings;
    }

    // Return defaults if no settings exist
    return {
      id: 'points-system',
      ...DEFAULT_POINTS_SETTINGS,
      updatedAt: Timestamp.now(),
      updatedBy: 'system',
    };
  } catch (error) {
    console.error('Error fetching points settings with defaults:', error);
    // Return defaults on error
    return {
      id: 'points-system',
      ...DEFAULT_POINTS_SETTINGS,
      updatedAt: Timestamp.now(),
      updatedBy: 'system',
    };
  }
}

/**
 * Get points for a challenge based on difficulty
 */
export async function getPointsForDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<number> {
  try {
    const settings = await getPointsSettingsWithDefaults();
    return settings.challenges[difficulty];
  } catch (error) {
    console.error('Error fetching points for difficulty:', error);
    // Return defaults on error
    return DEFAULT_POINTS_SETTINGS.challenges[difficulty];
  }
}

// ==================== BADGE SYSTEM ====================

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: {
    type: 'points' | 'challenges' | 'events' | 'projects' | 'custom';
    threshold?: number;
    condition?: string;
  };
  autoAward: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}
