import { useState, useEffect, useCallback } from 'react';
import { Resource } from '@/lib/firebase-collections';
import { resourceService } from '@/lib/services/resources';

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedResources = await resourceService.getResources();
      setResources(fetchedResources);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return {
    resources,
    loading,
    error,
    refetch: fetchResources,
  };
}

export function useResourcesByLevel(level: 'beginner' | 'intermediate' | 'advanced') {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResourcesByLevel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedResources = await resourceService.getResourcesByLevel(level);
      setResources(fetchedResources);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
      console.error('Error fetching resources by level:', err);
    } finally {
      setLoading(false);
    }
  }, [level]);

  useEffect(() => {
    fetchResourcesByLevel();
  }, [fetchResourcesByLevel]);

  return {
    resources,
    loading,
    error,
    refetch: fetchResourcesByLevel,
  };
}
