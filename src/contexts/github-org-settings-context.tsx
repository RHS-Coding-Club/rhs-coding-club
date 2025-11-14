'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getGitHubOrgSettingsWithDefaults, GitHubOrgSettings } from '@/lib/services/settings';

interface GitHubOrgSettingsContextType {
  settings: GitHubOrgSettings | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const GitHubOrgSettingsContext = createContext<GitHubOrgSettingsContextType | undefined>(undefined);

export function GitHubOrgSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GitHubOrgSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getGitHubOrgSettingsWithDefaults();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching GitHub org settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refetch = async () => {
    await fetchSettings();
  };

  return (
    <GitHubOrgSettingsContext.Provider value={{ settings, loading, refetch }}>
      {children}
    </GitHubOrgSettingsContext.Provider>
  );
}

export function useGitHubOrgSettings() {
  const context = useContext(GitHubOrgSettingsContext);
  if (context === undefined) {
    throw new Error('useGitHubOrgSettings must be used within a GitHubOrgSettingsProvider');
  }
  return context;
}
