import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
