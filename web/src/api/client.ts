import axios, { AxiosError } from 'axios';
import {
  AuthTokenResponse,
  Athlete,
  TwinOverview,
  TwinState,
  SessionItem,
  SessionDetailItem,
  TrendItem,
  AnomalyItem,
  MetricHistoryResponse,
  RecommendationItem,
  InsightItem,
  SystemHealth,
} from '../types';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://personal-sports-digital-twin.onrender.com';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes (300s) for video computer vision processing
});

// Attach JWT access token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sports_twin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses and normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sports_twin_token');
      localStorage.removeItem('sports_twin_athlete');
      // If unauthorized, redirect to login if not already on auth/landing
      if (!['/', '/login', '/register'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// High-level API Service Modules
export const api = {
  // System Health
  health: {
    check: async (): Promise<SystemHealth> => {
      const res = await axios.get<SystemHealth>(`${API_BASE_URL}/health`);
      return res.data;
    },
  },

  // Authentication & Profile
  auth: {
    login: async (email: string, password: string): Promise<AuthTokenResponse> => {
      const res = await apiClient.post<AuthTokenResponse>('/auth/login', { email, password });
      return res.data;
    },
    register: async (data: {
      email: string;
      password: string;
      display_name: string;
      sport?: string;
      experience_level?: string;
      height_cm?: number;
      weight_kg?: number;
    }): Promise<AuthTokenResponse> => {
      const res = await apiClient.post<AuthTokenResponse>('/auth/register', data);
      return res.data;
    },
    getMe: async (): Promise<Athlete> => {
      const res = await apiClient.get<Athlete>('/athletes/me');
      return res.data;
    },
    updateMe: async (data: Partial<Athlete>): Promise<Athlete> => {
      const res = await apiClient.put<Athlete>('/athletes/me', data);
      return res.data;
    },
  },

  // Digital Twin
  twin: {
    getOverview: async (): Promise<TwinOverview> => {
      const res = await apiClient.get<TwinOverview>('/twin');
      return res.data;
    },
    getHistory: async (): Promise<TwinState[]> => {
      const res = await apiClient.get<TwinState[]>('/twin/history');
      return res.data;
    },
    seedDemo: async (): Promise<{ status: string; total_sessions: number; state_version: number }> => {
      const res = await apiClient.post('/demo/seed');
      return res.data;
    },
  },

  // Sessions & Video Processing
  sessions: {
    upload: async (file: File, onProgress?: (pct: number) => void): Promise<SessionItem> => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post<SessionItem>('/sessions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(pct);
          }
        },
      });
      return res.data;
    },
    process: async (sessionId: string): Promise<SessionDetailItem> => {
      const res = await apiClient.post<SessionDetailItem>(
        `/sessions/${sessionId}/process`,
        {},
        { timeout: 300000 }
      );
      return res.data;
    },
    list: async (limit = 50, offset = 0): Promise<SessionItem[]> => {
      const res = await apiClient.get<SessionItem[]>('/sessions', {
        params: { limit, offset },
      });
      return res.data;
    },
    getById: async (sessionId: string): Promise<SessionDetailItem> => {
      const res = await apiClient.get<SessionDetailItem>(`/sessions/${sessionId}`);
      return res.data;
    },
    getVideoUrl: (filename: string): string => {
      return `${API_BASE_URL}/uploads/${filename}`;
    },
  },

  // Analytics, Trends, Anomalies & AI Recommendations
  analytics: {
    getTrends: async (): Promise<TrendItem[]> => {
      const res = await apiClient.get<TrendItem[]>('/trends');
      return res.data;
    },
    getAnomalies: async (): Promise<AnomalyItem[]> => {
      const res = await apiClient.get<AnomalyItem[]>('/anomalies');
      return res.data;
    },
    getMetricHistory: async (metricName: string): Promise<MetricHistoryResponse> => {
      const res = await apiClient.get<MetricHistoryResponse>(`/metrics/history/${metricName}`);
      return res.data;
    },
    getRecommendations: async (): Promise<RecommendationItem[]> => {
      const res = await apiClient.get<RecommendationItem[]>('/recommendations');
      return res.data;
    },
    getInsights: async (): Promise<InsightItem[]> => {
      const res = await apiClient.get<InsightItem[]>('/insights');
      return res.data;
    },
  },
};
