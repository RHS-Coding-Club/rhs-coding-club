import { useCallback, useEffect, useState } from 'react';
import { resourceBookmarkService } from '@/lib/services/resource-bookmarks';
import { useAuth } from '@/contexts/auth-context';
import { Resource } from '@/lib/firebase-collections';

interface UseResourceBookmarksResult {
  bookmarkedIds: string[];
  bookmarkedResources: Resource[];
  loading: boolean;
  toggleBookmark: (resourceId: string) => Promise<void>;
  isBookmarked: (resourceId: string) => boolean;
  refetch: () => Promise<void>;
}

export function useResourceBookmarks(): UseResourceBookmarksResult {
  const { user } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarkedIds([]);
      setBookmarkedResources([]);
      return;
    }
    setLoading(true);
    try {
      const resources = await resourceBookmarkService.getBookmarkedResources(user.uid);
      setBookmarkedResources(resources);
      setBookmarkedIds(resources.map(r => r.id));
    } catch (e) {
      console.error('Failed to load bookmarked resources', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const toggleBookmark = useCallback(async (resourceId: string) => {
    if (!user) return; // optionally you could throw or redirect to login
    try {
      const result = await resourceBookmarkService.toggleBookmark(user.uid, resourceId);
      setBookmarkedIds(prev => result === 'added' ? [...prev, resourceId] : prev.filter(id => id !== resourceId));
      if (result === 'removed') {
        setBookmarkedResources(prev => prev.filter(r => r.id !== resourceId));
      } else {
        // Lazy fetch the single resource; avoid full refetch
        // Importing here to prevent circular, using dynamic import
        import('@/lib/services/resources').then(async ({ resourceService }) => {
          const res = await resourceService.getResourceById(resourceId);
          if (res) setBookmarkedResources(prev => [...prev, res]);
        });
      }
    } catch (e) {
      console.error('Failed to toggle bookmark', e);
    }
  }, [user]);

  const isBookmarked = useCallback((resourceId: string) => bookmarkedIds.includes(resourceId), [bookmarkedIds]);

  return { bookmarkedIds, bookmarkedResources, loading, toggleBookmark, isBookmarked, refetch: fetchBookmarks };
}
