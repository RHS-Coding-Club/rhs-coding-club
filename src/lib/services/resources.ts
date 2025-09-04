import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Resource } from '@/lib/firebase-collections';

export interface CreateResourceData {
  title: string;
  description: string;
  url: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface UpdateResourceData extends Partial<CreateResourceData> {
  id: string;
}

export class ResourceService {
  private resourcesCollection = collection(db, 'resources');

  // Create a new resource
  async createResource(resourceData: CreateResourceData, addedBy: string): Promise<string> {
    const resource: Omit<Resource, 'id'> = {
      ...resourceData,
      addedBy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(this.resourcesCollection, resource);
    return docRef.id;
  }

  // Get all resources
  async getResources(): Promise<Resource[]> {
    const q = query(this.resourcesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Resource[];
  }

  // Get resources by level
  async getResourcesByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Promise<Resource[]> {
    const q = query(
      this.resourcesCollection,
      where('level', '==', level),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Resource[];
  }

  // Get a single resource by ID
  async getResourceById(id: string): Promise<Resource | null> {
    const docRef = doc(this.resourcesCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Resource;
    }
    
    return null;
  }

  // Update a resource
  async updateResource(resourceData: UpdateResourceData): Promise<void> {
    const { id, ...updateData } = resourceData;
    const docRef = doc(this.resourcesCollection, id);
    
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });
  }

  // Delete a resource
  async deleteResource(id: string): Promise<void> {
    const docRef = doc(this.resourcesCollection, id);
    await deleteDoc(docRef);
  }

  // Search resources by tags
  async searchResourcesByTags(tags: string[]): Promise<Resource[]> {
    const q = query(
      this.resourcesCollection,
      where('tags', 'array-contains-any', tags),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Resource[];
  }
}

export const resourceService = new ResourceService();
