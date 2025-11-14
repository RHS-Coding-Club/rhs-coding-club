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

// ==================== GITHUB ORGANIZATION SETTINGS ====================

export interface TeamAssignmentRule {
  teamSlug: string;
  teamName: string;
  condition: string;
  priority: number;
}

export interface GitHubOrgSettings {
  id: string;
  organizationName: string;
  autoInvite: boolean;
  defaultTeam?: string;
  defaultTeamName?: string;
  inviteExpiryDays: number;
  welcomeMessage: string;
  requirements: {
    requireVerifiedEmail: boolean;
    minimumPoints?: number;
    requireEventAttendance?: boolean;
  };
  teamAssignmentRules: TeamAssignmentRule[];
  updatedAt: Timestamp;
  updatedBy: string; // Admin user ID
}

// Default GitHub organization settings
const DEFAULT_GITHUB_ORG_SETTINGS: Omit<GitHubOrgSettings, 'id' | 'updatedAt' | 'updatedBy'> = {
  organizationName: process.env.NEXT_PUBLIC_GITHUB_ORG || 'RHS-Coding-Club',
  autoInvite: false,
  defaultTeam: '',
  defaultTeamName: '',
  inviteExpiryDays: 7,
  welcomeMessage: 'Welcome to our GitHub organization! We\'re excited to have you collaborate with us on exciting projects.',
  requirements: {
    requireVerifiedEmail: true,
    minimumPoints: 0,
    requireEventAttendance: false,
  },
  teamAssignmentRules: [],
};

/**
 * Get GitHub organization settings from Firestore
 */
export async function getGitHubOrgSettings(): Promise<GitHubOrgSettings | null> {
  try {
    const settingsRef = doc(db, 'settings', 'github-org');
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      return {
        id: settingsDoc.id,
        ...settingsDoc.data(),
      } as GitHubOrgSettings;
    }

    return null;
  } catch (error) {
    console.error('Error fetching GitHub org settings:', error);
    throw error;
  }
}

/**
 * Update or create GitHub organization settings
 */
export async function updateGitHubOrgSettings(
  settings: Partial<Omit<GitHubOrgSettings, 'id' | 'updatedAt' | 'updatedBy'>>,
  userId: string
): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'github-org');
    
    const updatedSettings = {
      ...settings,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    };

    await setDoc(settingsRef, updatedSettings, { merge: true });
  } catch (error) {
    console.error('Error updating GitHub org settings:', error);
    throw error;
  }
}

/**
 * Initialize GitHub organization settings with default values
 */
export async function initializeGitHubOrgSettings(userId: string): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'github-org');
    const settingsDoc = await getDoc(settingsRef);

    if (!settingsDoc.exists()) {
      await setDoc(settingsRef, {
        ...DEFAULT_GITHUB_ORG_SETTINGS,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
      });
    }
  } catch (error) {
    console.error('Error initializing GitHub org settings:', error);
    throw error;
  }
}

/**
 * Get GitHub organization settings or return defaults if not found
 */
export async function getGitHubOrgSettingsWithDefaults(): Promise<GitHubOrgSettings> {
  try {
    const settings = await getGitHubOrgSettings();
    
    if (settings) {
      return settings;
    }

    // Return defaults if no settings exist
    return {
      id: 'github-org',
      ...DEFAULT_GITHUB_ORG_SETTINGS,
      updatedAt: Timestamp.now(),
      updatedBy: 'system',
    };
  } catch (error) {
    console.error('Error fetching GitHub org settings with defaults:', error);
    // Return defaults on error
    return {
      id: 'github-org',
      ...DEFAULT_GITHUB_ORG_SETTINGS,
      updatedAt: Timestamp.now(),
      updatedBy: 'system',
    };
  }
}

// ==================== EMAIL & NOTIFICATION SETTINGS ====================

// Email & Notification Settings Interface
export interface EmailSettings {
  id: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  notifications: {
    newChallenge: boolean;
    challengeReminder: boolean;
    eventReminder: boolean;
    weeklyDigest: boolean;
    projectApproval: boolean;
  };
  reminderTiming: {
    challengeDeadline: number; // hours before
    eventStart: number; // hours before
  };
  templates: {
    welcome: string;
    challengeNotification: string;
    eventReminder: string;
  };
  updatedAt: Timestamp;
  updatedBy: string; // Admin user ID
}

// Default email settings
const DEFAULT_EMAIL_SETTINGS: Omit<EmailSettings, 'id' | 'updatedAt' | 'updatedBy'> = {
  senderName: 'RHS Coding Club',
  senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@rhscodingclub.com',
  replyToEmail: 'rhscodingclub@example.com',
  notifications: {
    newChallenge: true,
    challengeReminder: true,
    eventReminder: true,
    weeklyDigest: false,
    projectApproval: true,
  },
  reminderTiming: {
    challengeDeadline: 24, // 24 hours before
    eventStart: 2, // 2 hours before
  },
  templates: {
    welcome: 'Welcome to {{clubName}}! We\'re excited to have you join our community of passionate developers.',
    challengeNotification: 'A new challenge "{{challengeName}}" has been posted! Check it out and submit your solution.',
    eventReminder: 'Reminder: {{eventName}} is coming up on {{eventDate}}. Don\'t forget to RSVP!',
  },
};

/**
 * Get email settings from Firestore
 */
export async function getEmailSettings(): Promise<EmailSettings | null> {
  try {
    const settingsRef = doc(db, 'settings', 'email');
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      return {
        id: settingsDoc.id,
        ...settingsDoc.data(),
      } as EmailSettings;
    }

    return null;
  } catch (error) {
    console.error('Error fetching email settings:', error);
    throw error;
  }
}

/**
 * Update or create email settings
 */
export async function updateEmailSettings(
  settings: Partial<Omit<EmailSettings, 'id' | 'updatedAt' | 'updatedBy'>>,
  userId: string
): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'email');
    
    const updatedSettings = {
      ...settings,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    };

    await setDoc(settingsRef, updatedSettings, { merge: true });
  } catch (error) {
    console.error('Error updating email settings:', error);
    throw error;
  }
}

/**
 * Initialize email settings with default values
 */
export async function initializeEmailSettings(userId: string): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'email');
    const settingsDoc = await getDoc(settingsRef);

    if (!settingsDoc.exists()) {
      await setDoc(settingsRef, {
        ...DEFAULT_EMAIL_SETTINGS,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
      });
    }
  } catch (error) {
    console.error('Error initializing email settings:', error);
    throw error;
  }
}

/**
 * Get email settings or return defaults if not found
 */
export async function getEmailSettingsWithDefaults(): Promise<EmailSettings> {
  try {
    const settings = await getEmailSettings();
    
    if (settings) {
      return settings;
    }

    // Return defaults if no settings exist
    return {
      id: 'email',
      ...DEFAULT_EMAIL_SETTINGS,
      updatedAt: Timestamp.now(),
      updatedBy: 'system',
    };
  } catch (error) {
    console.error('Error fetching email settings with defaults:', error);
    // Return defaults on error
    return {
      id: 'email',
      ...DEFAULT_EMAIL_SETTINGS,
      updatedAt: Timestamp.now(),
      updatedBy: 'system',
    };
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
