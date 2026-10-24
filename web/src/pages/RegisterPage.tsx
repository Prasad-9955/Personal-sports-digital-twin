import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Dumbbell,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import athleteMotionImg from '../assets/athlete_motion.jpg';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    password: '',
    sport: 'running',
    experience_level: 'intermediate',
    height_cm: '',
    weight_kg: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.display_name || !formData.email || !formData.password) {
      setError('Please provide name, email, and password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await register({
        display_name: formData.display_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        sport: formData.sport,
        experience_level: formData.experience_level,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : undefined,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile. Email may already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surfaceObsidian flex flex-col lg:flex-row text-textLight">
      {/* Left Pane: Cinematic Biomechanical Showcase (Visible on lg screens) */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-between p-12 overflow-hidden bg-surfaceDark border-r border-borderSubtle">
        <div className="absolute inset-0 z-0">
          <img
            src={athleteMotionImg}
            alt="Biomechanical Athlete Tracking"
            className="w-full h-full object-cover object-center filter brightness-90 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surfaceObsidian via-surfaceDark/60 to-surfaceDark/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-surfaceDark/90" />
        </div>

        {/* Top Branding */}
        <div className="relative z-10">
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
        </div>

        {/* Informative Value Cards */}
        <div className="relative z-10 space-y-4 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accentCyan/15 border border-accentCyan/30 text-accentCyan text-xs font-bold tracking-wider uppercase font-mono">
            <Sparkles className="w-3.5 h-3.5 text-warningAmber" />
            <span>Anthropometric Calibration</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-textLight">
            Build Your Personal Digital Twin Baseline.
          </h2>

          <p className="text-sm text-textMuted leading-relaxed">
            Your biometric parameters (height, weight, discipline) calibrate individualized
            stride mechanics and baseline dispersion bounds (IQR & Modified Z-scores).
          </p>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-cardGlass backdrop-blur-md border border-borderSubtle text-xs">
              <CheckCircle2 className="w-4 h-4 text-emeraldGreen shrink-0" />
              <span>Personalized rolling median calculations (N ≥ 3 sessions)</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-cardGlass backdrop-blur-md border border-borderSubtle text-xs">
              <CheckCircle2 className="w-4 h-4 text-accentCyan shrink-0" />
              <span>Monocular pose tracking without expensive motion laboratories</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-cardGlass backdrop-blur-md border border-borderSubtle text-xs">
              <CheckCircle2 className="w-4 h-4 text-electricTeal shrink-0" />
              <span>Evidence-grounded coaching drills powered by Google Gemini</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center gap-3 text-xs text-textDim pt-6 border-t border-borderSubtle/50">
          <ShieldCheck className="w-4 h-4 text-accentCyan shrink-0" />
          <span>Non-medical kinematic optimization • Complete data privacy</span>
        </div>
      </div>

      {/* Right Pane: Registration Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 lg:px-16 relative overflow-hidden bg-surfaceObsidian">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-accentCyan/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="w-full max-w-lg relative z-10">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
              <div className="w-10 h-10 rounded-2xl bg-accent-gradient flex items-center justify-center text-surfaceObsidian shadow-neon-cyan">
                <Activity className="w-5 h-5 font-black" />
              </div>
            </Link>
            <h2 className="text-2xl font-extrabold tracking-tight text-textLight">
              SPORTS TWIN
            </h2>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-textLight">
              Athlete Onboarding
            </h2>
            <p className="text-xs text-textMuted mt-1">
              Configure your personal biometric & movement profile
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-dangerCoral/10 border border-dangerCoral/30 flex items-start gap-3 text-xs text-dangerCoral animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-7 md:p-8 rounded-3xl bg-cardDark/80 backdrop-blur-xl border border-borderSubtle shadow-glass-card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textLight uppercase tracking-wider mb-1.5">
                  Full Name / Athlete Handle
                </label>
                <div className="relative group">
                  <User className="w-4 h-4 text-textDim group-focus-within:text-accentCyan absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type="text"
                    required
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="Alex Morgan"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-surfaceDark/90 border border-borderSubtle focus:border-accentCyan focus:ring-1 focus:ring-accentCyan text-textLight text-sm placeholder:text-textDim transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textLight uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-textDim group-focus-within:text-accentCyan absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@athletics.org"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-surfaceDark/90 border border-borderSubtle focus:border-accentCyan focus:ring-1 focus:ring-accentCyan text-textLight text-sm placeholder:text-textDim transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textLight uppercase tracking-wider mb-1.5">
                  Password (min 6 characters)
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-textDim group-focus-within:text-accentCyan absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-surfaceDark/90 border border-borderSubtle focus:border-accentCyan focus:ring-1 focus:ring-accentCyan text-textLight text-sm placeholder:text-textDim transition-all outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textDim hover:text-textLight transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-textLight uppercase tracking-wider mb-1.5">
                    Sport Discipline
                  </label>
                  <select
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-xl bg-surfaceDark/90 border border-borderSubtle focus:border-accentCyan text-textLight text-sm outline-none cursor-pointer"
                  >
                    <option value="running">Distance Running</option>
                    <option value="sprinting">Sprinting & Hurdles</option>
                    <option value="jumping">Jumping & Agility</option>
                    <option value="athletics">General Athletics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textLight uppercase tracking-wider mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-xl bg-surfaceDark/90 border border-borderSubtle focus:border-accentCyan text-textLight text-sm outline-none cursor-pointer"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="elite">Elite / Collegiate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-textMuted uppercase tracking-wider mb-1">
                    Height (cm) - Optional
                  </label>
                  <input
                    type="number"
                    value={formData.height_cm}
                    onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                    placeholder="178"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surfaceDark/90 border border-borderSubtle focus:border-accentCyan text-textLight text-sm placeholder:text-textDim outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-textMuted uppercase tracking-wider mb-1">
                    Weight (kg) - Optional
                  </label>
                  <input
                    type="number"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    placeholder="70"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surfaceDark/90 border border-borderSubtle focus:border-accentCyan text-textLight text-sm placeholder:text-textDim outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent-gradient text-surfaceObsidian font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-neon-cyan active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Configuring Digital Twin...</span>
                  </>
                ) : (
                  <>
                    <span>Create Athlete Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-borderSubtle/60 text-center text-xs text-textMuted">
              Already registered in the system?{' '}
              <Link to="/login" className="font-bold text-accentCyan hover:underline ml-1">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

