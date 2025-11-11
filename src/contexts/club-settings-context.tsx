'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getClubSettingsWithDefaults, ClubSettings } from '@/lib/services/settings';

interface ClubSettingsContextType {
  settings: ClubSettings | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const ClubSettingsContext = createContext<ClubSettingsContextType | undefined>(undefined);

export function ClubSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ClubSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClubSettingsWithDefaults();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching club settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch club settings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <ClubSettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        refetch: fetchSettings,
      }}
    >
      {children}
    </ClubSettingsContext.Provider>
  );
}

export function useClubSettings() {
  const context = useContext(ClubSettingsContext);
  if (context === undefined) {
    throw new Error('useClubSettings must be used within a ClubSettingsProvider');
  }
  return context;
}
