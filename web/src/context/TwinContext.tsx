import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { TwinOverview } from '../types';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

interface TwinContextType {
  overview: TwinOverview | null;
  isLoading: boolean;
  isSeeding: boolean;
  error: string | null;
  refreshOverview: () => Promise<void>;
  seedDemoProgression: () => Promise<void>;
}

const TwinContext = createContext<TwinContextType | undefined>(undefined);

export const TwinProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [overview, setOverview] = useState<TwinOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshOverview = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.twin.getOverview();
      setOverview(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load Digital Twin overview');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshOverview();
    } else {
      setOverview(null);
    }
  }, [isAuthenticated, refreshOverview]);

  const seedDemoProgression = async () => {
    setIsSeeding(true);
    try {
      await api.twin.seedDemo();
      await refreshOverview();
    } catch (err: any) {
      setError(err.message || 'Failed to seed demo data');
      throw err;
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <TwinContext.Provider
      value={{
        overview,
        isLoading,
        isSeeding,
        error,
        refreshOverview,
        seedDemoProgression,
      }}
    >
      {children}
    </TwinContext.Provider>
  );
};

export const useTwin = () => {
  const context = useContext(TwinContext);
  if (!context) {
    throw new Error('useTwin must be used within a TwinProvider');
  }
  return context;
};
