'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSocialMediaSettingsWithDefaults, SocialMediaSettings } from '@/lib/services/settings';

interface SocialMediaContextType {
  settings: SocialMediaSettings | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const SocialMediaContext = createContext<SocialMediaContextType | undefined>(undefined);

export function SocialMediaProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SocialMediaSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSocialMediaSettingsWithDefaults();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching social media settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch social media settings'));
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
    <SocialMediaContext.Provider value={{ settings, loading, error, refetch }}>
      {children}
    </SocialMediaContext.Provider>
  );
}

export function useSocialMedia() {
  const context = useContext(SocialMediaContext);
  if (context === undefined) {
    throw new Error('useSocialMedia must be used within a SocialMediaProvider');
  }
  return context;
}
