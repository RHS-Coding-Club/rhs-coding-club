import { useState, useEffect, useCallback } from 'react';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Post } from '@/lib/firebase-collections';
import {
  getPublishedPosts,
  getAllPosts,
  getPostsByTag,
  getPostById,
  getPostBySlug,
  getPopularTags,
  createPost,
  updatePost,
  deletePost,
} from '@/lib/services/posts';

export function usePosts(includeUnpublished: boolean = false) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | undefined>();
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (reset: boolean = false, currentLastDoc?: QueryDocumentSnapshot<DocumentData>) => {
    try {
      setLoading(true);
      setError(null);

      const docToUse = reset ? undefined : currentLastDoc;
      const result = includeUnpublished
        ? await getAllPosts(10, docToUse)
        : await getPublishedPosts(10, docToUse);

      if (reset) {
        setPosts(result.posts);
      } else {
        setPosts(prev => [...prev, ...result.posts]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.posts.length === 10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [includeUnpublished]);

  const refreshPosts = useCallback(() => {
    setLastDoc(undefined);
    setHasMore(true);
    fetchPosts(true);
  }, [fetchPosts]);

  const loadMorePosts = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(false, lastDoc);
    }
  }, [loading, hasMore, fetchPosts, lastDoc]);

  useEffect(() => {
    fetchPosts(true);
  }, [includeUnpublished]);

  return {
    posts,
    loading,
    error,
    hasMore,
    refreshPosts,
    loadMorePosts,
  };
}

export function usePostsByTag(tag: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPostsByTag = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPostsByTag(tag);
      setPosts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [tag]);

  useEffect(() => {
    if (tag) {
      fetchPostsByTag();
    }
  }, [tag, fetchPostsByTag]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPostsByTag,
  };
}

export function usePost(id?: string, slug?: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!id && !slug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = id ? await getPostById(id) : await getPostBySlug(slug!);
      setPost(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch post');
    } finally {
      setLoading(false);
    }
  }, [id, slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return {
    post,
    loading,
    error,
    refetch: fetchPost,
  };
}

export function usePopularTags(limit: number = 10) {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPopularTags(limit);
      setTags(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    refetch: fetchTags,
  };
}

export function usePostMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const id = await createPost(postData);
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (
    id: string, 
    updates: Partial<Omit<Post, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    try {
      setLoading(true);
      setError(null);
      await updatePost(id, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update post';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deletePost(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    create,
    update,
    remove,
    loading,
    error,
  };
}
