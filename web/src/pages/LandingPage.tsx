import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Cpu,
  Video,
  Layers,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-surfaceDark text-textLight flex flex-col selection:bg-accentCyan selection:text-surfaceDark">
      {/* Top Navbar */}
      <header className="px-6 py-5 border-b border-borderSubtle bg-surfaceDark/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-gradient flex items-center justify-center text-surfaceDark shadow-neon-cyan font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-textLight block">
                SPORTS TWIN
              </span>
              <span className="text-[10px] text-accentCyan font-mono tracking-wider uppercase font-semibold">
                Biomechanical Telemetry
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-gradient text-surfaceDark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-neon-cyan"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-textLight hover:text-accentCyan transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-accent-gradient text-surfaceDark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-neon-cyan"
                >
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-28 overflow-hidden">
        {/* Glow Halos */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accentCyan/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-electricTeal/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cardGlass border border-accentCyan/30 text-accentCyan text-xs font-bold uppercase tracking-wider mb-6 shadow-neon-cyan/20">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Next-Generation Sports-Tech Vision Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-textLight leading-[1.1] mb-6">
            Your Personal Biomechanical{' '}
            <span className="text-transparent bg-clip-text bg-accent-gradient">
              Digital Twin.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-textMuted max-w-2xl mx-auto leading-relaxed mb-10">
            Extract 33 full-body joint landmarks from standard smartphone video, track
            longitudinal kinematics against your personal baseline, and receive grounded AI
            coaching from Google Gemini.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-accent-gradient text-surfaceDark font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all shadow-neon-cyan active:scale-95"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Create Athlete Profile'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/upload"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-cardDark hover:bg-cardGlass border border-borderSubtle text-textLight font-bold text-sm tracking-wide transition-all"
            >
              <Video className="w-4 h-4 text-accentCyan" />
              <span>Upload Video</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-12 border-t border-borderSubtle/60 text-left">
            <div className="p-4 rounded-2xl bg-cardDark/50 border border-borderSubtle">
              <span className="text-2xl md:text-3xl font-extrabold font-mono text-accentCyan block">
                33
              </span>
              <span className="text-xs text-textMuted uppercase tracking-wider font-semibold">
                BlazePose Landmarks
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-cardDark/50 border border-borderSubtle">
              <span className="text-2xl md:text-3xl font-extrabold font-mono text-electricTeal block">
                0 Wearables
              </span>
              <span className="text-xs text-textMuted uppercase tracking-wider font-semibold">
                Monocular RGB Video
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-cardDark/50 border border-borderSubtle">
              <span className="text-2xl md:text-3xl font-extrabold font-mono text-emeraldGreen block">
                N ≥ 3
              </span>
              <span className="text-xs text-textMuted uppercase tracking-wider font-semibold">
                Rolling Baseline Filter
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-cardDark/50 border border-borderSubtle">
              <span className="text-2xl md:text-3xl font-extrabold font-mono text-warningAmber block">
                v2.0 State
              </span>
              <span className="text-xs text-textMuted uppercase tracking-wider font-semibold">
                Immutable Versioning
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Pipeline Section */}
      <section className="px-6 py-20 bg-cardDark/30 border-t border-borderSubtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-textLight mb-3">
              The Digital Twin Pipeline
            </h2>
            <p className="text-sm text-textMuted">
              From raw sports video to longitudinal kinematic state representation and AI feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-cardDark border border-borderSubtle relative group hover:border-accentCyan/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-accentCyan/10 border border-accentCyan/20 flex items-center justify-center text-accentCyan mb-4 font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-textLight mb-2 flex items-center gap-2">
                <Video className="w-4 h-4 text-accentCyan" />
                <span>OpenCV & BlazePose</span>
              </h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Ingests MP4/MOV footage, assesses frame rates and duration, and detects 33 body
                landmarks with frame-level visibility confidence gating.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-cardDark border border-borderSubtle relative group hover:border-electricTeal/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-electricTeal/10 border border-electricTeal/20 flex items-center justify-center text-electricTeal mb-4 font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-textLight mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-electricTeal" />
                <span>Kinematic Trigonometry</span>
              </h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Derives Sagittal Trunk Inclination, bilateral Knee Flexion angles, Bilateral
                Symmetry Index (SI %), and Step Cadence without intrusive physical sensors.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-cardDark border border-borderSubtle relative group hover:border-emeraldGreen/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emeraldGreen/10 border border-emeraldGreen/20 flex items-center justify-center text-emeraldGreen mb-4 font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-textLight mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emeraldGreen" />
                <span>Personal Baselines</span>
              </h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Calculates rolling medians and interquartile ranges (IQR). Compares sessions against
                your personal norms using modified Z-scores rather than population averages.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-cardDark border border-borderSubtle relative group hover:border-accentCyan/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-accentCyan/10 border border-accentCyan/20 flex items-center justify-center text-accentCyan mb-4 font-bold text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-textLight mb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accentCyan" />
                <span>Immutable Twin States</span>
              </h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Creates auditable state version snapshots (v1, v2, v3...) tracking longitudinal
                adaptation, data quality index, and cumulative training load.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-6 rounded-2xl bg-cardDark border border-borderSubtle relative group hover:border-warningAmber/40 transition-all md:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-warningAmber/10 border border-warningAmber/20 flex items-center justify-center text-warningAmber mb-4 font-bold text-sm">
                05
              </div>
              <h3 className="text-base font-bold text-textLight mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-warningAmber" />
                <span>Grounded Gemini 3.8 Flash Coaching</span>
              </h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Synthesizes analytical evidence into structured drills and non-medical biomechanical
                rationales, strictly grounded in empirical observations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-8 border-t border-borderSubtle text-center text-xs text-textDim">
        <p>Personal Sports Digital Twin Platform • Biomechanical Telemetry Engine</p>
        <p className="mt-1 text-[11px] opacity-70">
          Strictly for athletic movement guidance and biomechanical trajectory monitoring. Not a
          medical diagnostic device.
        </p>
      </footer>
    </div>
  );
};
