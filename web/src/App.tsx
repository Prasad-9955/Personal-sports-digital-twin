import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TwinProvider } from './context/TwinContext';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { VideoUploadPage } from './pages/VideoUploadPage';
import { SessionDetailPage } from './pages/SessionDetailPage';
import { SessionsHistoryPage } from './pages/SessionsHistoryPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { MetricTrendsPage } from './pages/MetricTrendsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surfaceDark flex items-center justify-center text-accentCyan font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accentCyan border-t-transparent rounded-full animate-spin" />
          <span>Verifying athlete authentication session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <AppShell>
      <ErrorBoundary>{children}</ErrorBoundary>
    </AppShell>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <TwinProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Athlete Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <VideoUploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sessions/:sessionId"
                element={
                  <ProtectedRoute>
                    <SessionDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <SessionsHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/digital-twin"
                element={
                  <ProtectedRoute>
                    <DigitalTwinPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trends"
                element={
                  <ProtectedRoute>
                    <MetricTrendsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/insights"
                element={
                  <ProtectedRoute>
                    <RecommendationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TwinProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
