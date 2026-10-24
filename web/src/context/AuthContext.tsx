import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Athlete } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  athlete: Athlete | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    display_name: string;
    sport?: string;
    experience_level?: string;
    height_cm?: number;
    weight_kg?: number;
  }) => Promise<void>;
  logout: () => void;
  refreshAthlete: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [athlete, setAthlete] = useState<Athlete | null>(() => {
    const saved = localStorage.getItem('sports_twin_athlete');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshAthlete = async () => {
    try {
      const data = await api.auth.getMe();
      setAthlete(data);
      localStorage.setItem('sports_twin_athlete', JSON.stringify(data));
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('sports_twin_token');
    if (token) {
      refreshAthlete().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, password);
      localStorage.setItem('sports_twin_token', res.access_token);
      // Fetch fresh athlete record
      const me = await api.auth.getMe();
      setAthlete(me);
      localStorage.setItem('sports_twin_athlete', JSON.stringify(me));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    display_name: string;
    sport?: string;
    experience_level?: string;
    height_cm?: number;
    weight_kg?: number;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      localStorage.setItem('sports_twin_token', res.access_token);
      const me = await api.auth.getMe();
      setAthlete(me);
      localStorage.setItem('sports_twin_athlete', JSON.stringify(me));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sports_twin_token');
    localStorage.removeItem('sports_twin_athlete');
    setAthlete(null);
  };

  return (
    <AuthContext.Provider
      value={{
        athlete,
        isAuthenticated: !!athlete,
        isLoading,
        login,
        register,
        logout,
        refreshAthlete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
