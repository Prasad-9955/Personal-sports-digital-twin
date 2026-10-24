import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import athleteMotionImg from '../assets/athlete_motion.jpg';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFillDemo = () => {
    setEmail('athlete@example.com');
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-surfaceObsidian flex flex-col lg:flex-row text-textLight">
      {/* Left Pane: Cinematic Biomechanical Showcase (Visible on lg screens) */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between p-12 overflow-hidden bg-surfaceDark border-r border-borderSubtle">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={athleteMotionImg}
            alt="Biomechanical Athlete Tracking"
            className="w-full h-full object-cover object-center filter brightness-90 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surfaceObsidian via-surfaceDark/60 to-surfaceDark/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-surfaceDark/90" />
        </div>

        {/* Top Branding Pill */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-accent-gradient flex items-center justify-center text-surfaceObsidian shadow-neon-cyan group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 font-black" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-textLight block">
                SPORTS TWIN
              </span>
              <span className="text-[10px] text-accentCyan font-mono tracking-widest uppercase font-bold">
                Biomechanics Lab v2.0
              </span>
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cardGlass backdrop-blur-md border border-borderSubtle text-xs font-mono text-emeraldGreen">
            <span className="w-2 h-2 rounded-full bg-emeraldGreen animate-ping" />
            <span>Telemetry Online</span>
          </div>
        </div>

        {/* Central Dynamic Biomechanical Cards */}
        <div className="relative z-10 max-w-lg space-y-4 my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accentCyan/15 border border-accentCyan/30 text-accentCyan text-xs font-bold tracking-wider uppercase font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>Monocular RGB Computer Vision</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-textLight">
            Personal Biomechanical Intelligence & Digital Twin Evolution.
          </h1>

          <p className="text-sm text-textMuted leading-relaxed">
            Extract 33 full-body landmarks from standard smartphone video. Track joint kinematics,
            establish personalized rolling baselines, and receive grounded Gemini coaching drills.
          </p>

          {/* Telemetry Snapshot Chips */}
          <div className="grid grid-cols-3 gap-3 pt-3">
            <div className="p-3.5 rounded-2xl bg-cardGlass backdrop-blur-md border border-borderSubtle">
              <span className="text-[10px] font-mono uppercase text-textDim block">Vision Landmarks</span>
              <span className="text-xl font-extrabold font-mono text-accentCyan">33 Pts</span>
              <span className="text-[10px] text-textMuted block mt-0.5">MediaPipe BlazePose</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cardGlass backdrop-blur-md border border-borderSubtle">
              <span className="text-[10px] font-mono uppercase text-textDim block">Sampling Rate</span>
              <span className="text-xl font-extrabold font-mono text-perfLime">60 FPS</span>
              <span className="text-[10px] text-textMuted block mt-0.5">High Frequency</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cardGlass backdrop-blur-md border border-borderSubtle">
              <span className="text-[10px] font-mono uppercase text-textDim block">Twin Versioning</span>
              <span className="text-xl font-extrabold font-mono text-electricTeal">v8 State</span>
              <span className="text-[10px] text-emeraldGreen block mt-0.5">Active Sync</span>
            </div>
          </div>
        </div>

        {/* Bottom Educational Grounding Tag */}
        <div className="relative z-10 flex items-center gap-3 text-xs text-textDim pt-6 border-t border-borderSubtle/50">
          <ShieldCheck className="w-4 h-4 text-accentCyan shrink-0" />
          <span>Validated against sports science biomechanics • Pure mathematical non-medical modeling</span>
        </div>
      </div>

      {/* Right Pane: Authentication Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 relative overflow-hidden bg-surfaceObsidian">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accentCyan/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-electricTeal/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <div className="w-11 h-11 rounded-2xl bg-accent-gradient flex items-center justify-center text-surfaceObsidian shadow-neon-cyan">
                <Activity className="w-5 h-5 font-black" />
              </div>
            </Link>
            <h2 className="text-2xl font-extrabold tracking-tight text-textLight">
              SPORTS TWIN
            </h2>
            <p className="text-xs text-textMuted mt-1">
              Biomechanical Telemetry & Digital Twin Engine
            </p>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-textLight">
              Athlete Sign In
            </h2>
            <p className="text-xs text-textMuted mt-1.5">
              Enter credentials to access telemetry dashboard and twin states
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-dangerCoral/10 border border-dangerCoral/30 flex items-start gap-3 text-xs text-dangerCoral animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Login Card */}
          <div className="p-7 md:p-8 rounded-3xl bg-cardDark/80 backdrop-blur-xl border border-borderSubtle shadow-glass-card">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-textLight uppercase tracking-wider mb-2">
                  Athlete Email Address
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-textDim group-focus-within:text-accentCyan absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="athlete@athletics.org"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surfaceDark/90 border border-borderSubtle focus:border-accentCyan focus:ring-1 focus:ring-accentCyan text-textLight text-sm placeholder:text-textDim transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password Input with Visibility Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-textLight uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-textDim group-focus-within:text-accentCyan absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-surfaceDark/90 border border-borderSubtle focus:border-accentCyan focus:ring-1 focus:ring-accentCyan text-textLight text-sm placeholder:text-textDim transition-all outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textDim hover:text-textLight transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 flex items-center justify-center gap-2.5 py-4 rounded-xl bg-accent-gradient text-surfaceObsidian font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-neon-cyan active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating Athlete...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Fill Demo Helper for Testing */}
              <button
                type="button"
                onClick={handleQuickFillDemo}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cardGlass border border-borderSubtle hover:border-accentCyan/40 text-textMuted hover:text-accentCyan text-xs font-mono transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-warningAmber" />
                <span>Quick-Fill Sample Credentials</span>
              </button>
            </form>

            {/* Registration link */}
            <div className="mt-6 pt-5 border-t border-borderSubtle/60 text-center text-xs text-textMuted">
              New athlete to the telemetry system?{' '}
              <Link to="/register" className="font-bold text-accentCyan hover:underline ml-1">
                Create Athlete Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

