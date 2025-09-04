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
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/lib/firebase-collections';

const POSTS_COLLECTION = 'posts';

// Helper function to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Convert Firestore document to Post interface
function convertToPost(doc: QueryDocumentSnapshot<DocumentData>): Post {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    summary: data.summary,
    content: data.content,
    tags: data.tags || [],
    author: data.author,
    authorId: data.authorId,
    published: data.published,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    slug: data.slug,
  };
}

// Get all published posts
export async function getPublishedPosts(
  limitCount: number = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ posts: Post[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
  let q = query(
    collection(db, POSTS_COLLECTION),
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  if (lastDoc) {
    q = query(
      collection(db, POSTS_COLLECTION),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(limitCount)
    );
  }

  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(convertToPost);
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1];

  return {
    posts,
    lastDoc: newLastDoc,
  };
}

// Get all posts (for admin)
export async function getAllPosts(
  limitCount: number = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ posts: Post[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
  let q = query(
    collection(db, POSTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  if (lastDoc) {
    q = query(
      collection(db, POSTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(limitCount)
    );
  }

  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(convertToPost);
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1];

  return {
    posts,
    lastDoc: newLastDoc,
  };
}

// Get posts by tag
export async function getPostsByTag(
  tag: string,
  limitCount: number = 10
): Promise<Post[]> {
  const q = query(
    collection(db, POSTS_COLLECTION),
    where('published', '==', true),
    where('tags', 'array-contains', tag),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(convertToPost);
}

// Get post by ID
export async function getPostById(id: string): Promise<Post | null> {
  const docRef = doc(db, POSTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return convertToPost(docSnap as QueryDocumentSnapshot<DocumentData>);
  }

  return null;
}

// Get post by slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const q = query(
    collection(db, POSTS_COLLECTION),
    where('slug', '==', slug),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.docs.length > 0) {
    return convertToPost(snapshot.docs[0]);
  }

  return null;
}

// Create a new post
export async function createPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = Timestamp.now();
  const slug = postData.slug || generateSlug(postData.title);

  const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
    ...postData,
    slug,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

// Update a post
export async function updatePost(
  id: string,
  updates: Partial<Omit<Post, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const docRef = doc(db, POSTS_COLLECTION, id);
  const now = Timestamp.now();

  // Generate new slug if title is being updated
  if (updates.title && !updates.slug) {
    updates.slug = generateSlug(updates.title);
  }

  await updateDoc(docRef, {
    ...updates,
    updatedAt: now,
  });
}

// Delete a post
export async function deletePost(id: string): Promise<void> {
  const docRef = doc(db, POSTS_COLLECTION, id);
  await deleteDoc(docRef);
}

// Get unique tags from all published posts
export async function getPopularTags(limit: number = 10): Promise<string[]> {
  const q = query(
    collection(db, POSTS_COLLECTION),
    where('published', '==', true)
  );

  const snapshot = await getDocs(q);
  const tagCounts: Record<string, number> = {};

  snapshot.docs.forEach((doc) => {
    const tags = doc.data().tags || [];
    tags.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([tag]) => tag);
}
