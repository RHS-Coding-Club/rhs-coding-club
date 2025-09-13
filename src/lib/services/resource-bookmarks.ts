import { 
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Resource } from '@/lib/firebase-collections';
import { resourceService } from './resources';

export interface UserResourceBookmarkDoc {
  resourceId: string;
  createdAt: Timestamp;
}

class ResourceBookmarkService {
  private getUserCollection = (userId: string) => collection(db, 'users', userId, 'bookmarkedResources');

  async isBookmarked(userId: string, resourceId: string): Promise<boolean> {
    const ref = doc(this.getUserCollection(userId), resourceId);
    const snap = await getDoc(ref);
    return snap.exists();
  }

  async addBookmark(userId: string, resourceId: string): Promise<void> {
    const ref = doc(this.getUserCollection(userId), resourceId);
    await setDoc(ref, { resourceId, createdAt: Timestamp.now() } satisfies UserResourceBookmarkDoc);
  }

  async removeBookmark(userId: string, resourceId: string): Promise<void> {
    const ref = doc(this.getUserCollection(userId), resourceId);
    await deleteDoc(ref);
  }

  async toggleBookmark(userId: string, resourceId: string): Promise<'added' | 'removed'> {
    const exists = await this.isBookmarked(userId, resourceId);
    if (exists) {
      await this.removeBookmark(userId, resourceId);
      return 'removed';
    }
    await this.addBookmark(userId, resourceId);
    return 'added';
  }

  async getBookmarkedResourceIds(userId: string): Promise<string[]> {
    const col = this.getUserCollection(userId);
    const snapshot = await getDocs(col);
    return snapshot.docs.map(d => (d.data() as UserResourceBookmarkDoc).resourceId);
  }

  async getBookmarkedResources(userId: string): Promise<Resource[]> {
    const ids = await this.getBookmarkedResourceIds(userId);
    if (!ids.length) return [];
    const results: Resource[] = [];
    await Promise.all(ids.map(async (id) => {
      const res = await resourceService.getResourceById(id);
      if (res) results.push(res);
    }));
    return results;
  }
}

export const resourceBookmarkService = new ResourceBookmarkService();
