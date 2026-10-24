import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  History,
  Cpu,
  TrendingUp,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  Activity,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { SystemHealth } from '../../types';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { athlete, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    // Check backend health periodically
    const check = async () => {
      try {
        const data = await api.health.check();
        setHealth(data);
      } catch {
        setHealth({
          status: 'DEGRADED',
          database_connected: false,
          environment: 'offline',
          gemini_api_configured: false,
        });
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/dashboard', label: 'Twin Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Analyze Video', icon: UploadCloud },
    { to: '/history', label: 'Session History', icon: History },
    { to: '/digital-twin', label: 'Digital Twin State', icon: Cpu },
    { to: '/trends', label: 'Kinematic Trends', icon: TrendingUp },
    { to: '/insights', label: 'Gemini AI Coaching', icon: Sparkles },
    { to: '/profile', label: 'Athlete Profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surfaceDark text-textLight flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3.5 bg-cardDark/90 backdrop-blur-md border-b border-borderSubtle sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-gradient flex items-center justify-center text-surfaceDark shadow-neon-cyan">
            <Activity className="w-4 h-4 font-black" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-textLight">
            SPORTS TWIN
          </span>
        </div>

        <div className="flex items-center gap-2">
          {health && (
            <span
              title={`Backend: ${health.status}`}
              className={`w-2.5 h-2.5 rounded-full ${
                health.status === 'HEALTHY' ? 'bg-emeraldGreen animate-pulse' : 'bg-dangerCoral'
              }`}
            />
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-cardGlass border border-borderSubtle text-textLight"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Desktop / Tablet Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-cardDark border-r border-borderSubtle shrink-0 sticky top-0 h-screen select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-borderSubtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-gradient flex items-center justify-center text-surfaceDark shadow-neon-cyan font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-textLight">
                SPORTS TWIN
              </h1>
              <span className="text-[10px] text-accentCyan font-mono tracking-wider uppercase font-semibold">
                Digital Twin Engine
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-accentCyan/15 text-accentCyan border border-accentCyan/30 shadow-neon-cyan/20'
                      : 'text-textMuted hover:text-textLight hover:bg-cardGlass/60 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Athlete Info & Logout */}
        <div className="p-4 border-t border-borderSubtle bg-surfaceDark/40">
          <div className="flex items-center justify-between p-3 rounded-xl bg-cardGlass/80 border border-borderSubtle mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-accentCyan/15 border border-accentCyan/30 flex items-center justify-center text-accentCyan font-bold text-xs shrink-0">
                {athlete?.display_name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-textLight truncate">
                  {athlete?.display_name || 'Athlete'}
                </p>
                <p className="text-[10px] text-textDim uppercase tracking-wider font-mono">
                  {athlete?.sport || 'Running'}
                </p>
              </div>
            </div>

            {health && (
              <span
                title={`Database: ${health.database_connected ? 'Connected' : 'Disconnected'}`}
                className={`w-2 h-2 rounded-full shrink-0 ${
                  health.status === 'HEALTHY' ? 'bg-emeraldGreen' : 'bg-dangerCoral'
                }`}
              />
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-dangerCoral hover:bg-dangerCoral/10 border border-transparent hover:border-dangerCoral/30 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-4/5 max-w-xs bg-cardDark border-r border-borderSubtle h-full z-10 p-5">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-borderSubtle">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent-gradient flex items-center justify-center text-surfaceDark">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm tracking-tight text-textLight">
                  SPORTS TWIN
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-textMuted hover:text-textLight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-accentCyan/15 text-accentCyan border border-accentCyan/30'
                          : 'text-textMuted hover:text-textLight hover:bg-cardGlass'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-borderSubtle mt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-dangerCoral bg-dangerCoral/10 border border-dangerCoral/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar for Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-surfaceDark/80 backdrop-blur-md border-b border-borderSubtle sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-textDim tracking-wider uppercase">
              Athlete Space
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-textDim" />
            <span className="text-xs font-bold text-textLight uppercase tracking-wider">
              {athlete?.sport || 'Track & Field'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* System Status Pill */}
            {health && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cardGlass border border-borderSubtle text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    health.status === 'HEALTHY'
                      ? 'bg-emeraldGreen animate-pulse'
                      : 'bg-warningAmber'
                  }`}
                />
                <span className="text-textMuted font-mono text-[11px]">
                  Backend: {health.status}
                </span>
                {health.gemini_api_configured && (
                  <span className="text-accentCyan text-[10px] font-bold tracking-wider uppercase border-l border-borderSubtle pl-2">
                    AI Active
                  </span>
                )}
              </div>
            )}

            {/* Quick Upload CTA */}
            <NavLink
              to="/upload"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-accent-gradient text-surfaceDark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-neon-cyan active:scale-95"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Video</span>
            </NavLink>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
};
