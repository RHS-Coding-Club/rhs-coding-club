'use client';

import { useState, useEffect } from 'react';
import { projectService, ProjectWithAuthor, ProjectFilters } from '@/lib/services/projects';

export function useProjects(filters?: ProjectFilters) {
  const [projects, setProjects] = useState<ProjectWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getProjects(filters);
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [JSON.stringify(filters)]);

  const refetch = () => {
    loadProjects();
  };

  return {
    projects,
    loading,
    error,
    refetch
  };
}

export function useProject(id: string) {
  const [project, setProject] = useState<ProjectWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await projectService.getProject(id);
        setProject(data);
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProject();
    }
  }, [id]);

  return {
    project,
    loading,
    error
  };
}