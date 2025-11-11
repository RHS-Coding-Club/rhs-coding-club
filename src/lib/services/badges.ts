import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Badge Interface
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

export interface UserBadge {
  badgeId: string;
  userId: string;
  awardedAt: Timestamp;
  awardedBy: string; // 'auto' or admin user ID
}

/**
 * Create a new badge
 */
export async function createBadge(
  badgeData: Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<string> {
  try {
    const badgesRef = collection(db, 'badges');
    const newBadgeRef = doc(badgesRef);
    
    const badge: Omit<Badge, 'id'> = {
      ...badgeData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: userId,
      updatedBy: userId,
    };

    await setDoc(newBadgeRef, badge);
    return newBadgeRef.id;
  } catch (error) {
    console.error('Error creating badge:', error);
    throw error;
  }
}

/**
 * Get all badges
 */
export async function getAllBadges(includeInactive = false): Promise<Badge[]> {
  try {
    const badgesRef = collection(db, 'badges');
    let q = query(badgesRef, orderBy('displayOrder', 'asc'));
    
    if (!includeInactive) {
      q = query(badgesRef, where('isActive', '==', true), orderBy('displayOrder', 'asc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Badge));
  } catch (error) {
    console.error('Error fetching badges:', error);
    throw error;
  }
}

/**
 * Get a single badge by ID
 */
export async function getBadgeById(badgeId: string): Promise<Badge | null> {
  try {
    const badgeRef = doc(db, 'badges', badgeId);
    const badgeDoc = await getDoc(badgeRef);

    if (badgeDoc.exists()) {
      return {
        id: badgeDoc.id,
        ...badgeDoc.data(),
      } as Badge;
    }

    return null;
  } catch (error) {
    console.error('Error fetching badge:', error);
    throw error;
  }
}

/**
 * Update a badge
 */
export async function updateBadge(
  badgeId: string,
  updates: Partial<Omit<Badge, 'id' | 'createdAt' | 'createdBy'>>,
  userId: string
): Promise<void> {
  try {
    const badgeRef = doc(db, 'badges', badgeId);
    
    await updateDoc(badgeRef, {
      ...updates,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    });
  } catch (error) {
    console.error('Error updating badge:', error);
    throw error;
  }
}

/**
 * Delete a badge
 */
export async function deleteBadge(badgeId: string): Promise<void> {
  try {
    const badgeRef = doc(db, 'badges', badgeId);
    await deleteDoc(badgeRef);
    
    // Also delete all user badge awards
    const userBadgesRef = collection(db, 'user-badges');
    const q = query(userBadgesRef, where('badgeId', '==', badgeId));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error('Error deleting badge:', error);
    throw error;
  }
}

/**
 * Reorder badges
 */
export async function reorderBadges(
  badgeOrders: { id: string; order: number }[],
  userId: string
): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    badgeOrders.forEach(({ id, order }) => {
      const badgeRef = doc(db, 'badges', id);
      batch.update(badgeRef, {
        displayOrder: order,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error reordering badges:', error);
    throw error;
  }
}

/**
 * Award a badge to a user
 */
export async function awardBadgeToUser(
  userId: string,
  badgeId: string,
  awardedBy: string
): Promise<void> {
  try {
    const userBadgeRef = doc(db, 'user-badges', `${userId}_${badgeId}`);
    
    const userBadge = {
      userId: userId,
      badgeId: badgeId,
      awardedAt: Timestamp.now(),
      awardedBy: awardedBy,
    };

    await setDoc(userBadgeRef, userBadge);
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }
}

/**
 * Revoke a badge from a user
 */
export async function revokeBadgeFromUser(
  userId: string,
  badgeId: string
): Promise<void> {
  try {
    const userBadgeRef = doc(db, 'user-badges', `${userId}_${badgeId}`);
    await deleteDoc(userBadgeRef);
  } catch (error) {
    console.error('Error revoking badge:', error);
    throw error;
  }
}

/**
 * Get all badges for a user
 */
export async function getUserBadges(userId: string): Promise<Badge[]> {
  try {
    const userBadgesRef = collection(db, 'user-badges');
    const q = query(userBadgesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    const badgeIds = snapshot.docs.map(doc => doc.data().badgeId);
    
    if (badgeIds.length === 0) {
      return [];
    }

    const badges: Badge[] = [];
    for (const badgeId of badgeIds) {
      const badge = await getBadgeById(badgeId);
      if (badge && badge.isActive) {
        badges.push(badge);
      }
    }

    return badges.sort((a, b) => a.displayOrder - b.displayOrder);
  } catch (error) {
    console.error('Error fetching user badges:', error);
    throw error;
  }
}

/**
 * Check if user has a specific badge
 */
export async function userHasBadge(userId: string, badgeId: string): Promise<boolean> {
  try {
    const userBadgeRef = doc(db, 'user-badges', `${userId}_${badgeId}`);
    const userBadgeDoc = await getDoc(userBadgeRef);
    return userBadgeDoc.exists();
  } catch (error) {
    console.error('Error checking user badge:', error);
    return false;
  }
}

/**
 * Auto-award badges based on criteria
 */
export async function checkAndAwardBadges(
  userId: string,
  userStats: {
    totalPoints?: number;
    completedChallenges?: number;
    eventsAttended?: number;
    projectsSubmitted?: number;
  }
): Promise<string[]> {
  try {
    const badges = await getAllBadges();
    const awardedBadges: string[] = [];

    for (const badge of badges) {
      if (!badge.autoAward) continue;

      const hasBadge = await userHasBadge(userId, badge.id);
      if (hasBadge) continue;

      let shouldAward = false;

      switch (badge.criteria.type) {
        case 'points':
          if (userStats.totalPoints && badge.criteria.threshold) {
            shouldAward = userStats.totalPoints >= badge.criteria.threshold;
          }
          break;
        case 'challenges':
          if (userStats.completedChallenges && badge.criteria.threshold) {
            shouldAward = userStats.completedChallenges >= badge.criteria.threshold;
          }
          break;
        case 'events':
          if (userStats.eventsAttended && badge.criteria.threshold) {
            shouldAward = userStats.eventsAttended >= badge.criteria.threshold;
          }
          break;
        case 'projects':
          if (userStats.projectsSubmitted && badge.criteria.threshold) {
            shouldAward = userStats.projectsSubmitted >= badge.criteria.threshold;
          }
          break;
        default:
          break;
      }

      if (shouldAward) {
        await awardBadgeToUser(userId, badge.id, 'auto');
        awardedBadges.push(badge.id);
      }
    }

    return awardedBadges;
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
    return [];
  }
}
