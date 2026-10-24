import React from 'react';
import { Cpu, Sparkles, Database, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { TwinOverview } from '../../types';

interface TwinStatusCardProps {
  overview: TwinOverview | null;
  onSeedDemo: () => Promise<void>;
  isSeeding: boolean;
}

export const TwinStatusCard: React.FC<TwinStatusCardProps> = ({
  overview,
  onSeedDemo,
  isSeeding,
}) => {
  const activeState = overview?.active_state;
  const stateVersion = activeState ? `v${activeState.state_version}` : 'v0 (Init)';
  const totalSessions = overview?.total_sessions ?? 0;
  const hasBaseline = overview?.has_baseline ?? false;
  const rawQuality = activeState?.data_quality_index;
  const qualityIndex = rawQuality != null
    ? (rawQuality > 1.0 ? rawQuality : rawQuality * 100).toFixed(0)
    : '--';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-hero-gradient border border-accentCyan/30 p-6 md:p-8 shadow-2xl">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accentCyan/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-electricTeal/10 rounded-full blur-3xl pointer-events-none -mb-20" />

      {/* Header Row */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-cardDark/80 border border-accentCyan/40 text-accentCyan shadow-neon-cyan">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-extrabold text-textLight tracking-tight">
                Athlete Digital Twin
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-accentCyan/15 text-accentCyan border border-accentCyan/30 font-mono">
                {stateVersion}
              </span>
            </div>
            <p className="text-xs text-textMuted mt-0.5">
              Longitudinal Biomechanical State Representation & History
            </p>
          </div>
        </div>

        {/* Demo Seed CTA */}
        <button
          onClick={onSeedDemo}
          disabled={isSeeding}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cardDark/90 hover:bg-cardDark border border-accentCyan/40 hover:border-accentCyan text-textLight text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-neon-cyan/30 active:scale-95 disabled:opacity-50"
        >
          {isSeeding ? (
            <RefreshCw className="w-4 h-4 animate-spin text-accentCyan" />
          ) : (
            <Sparkles className="w-4 h-4 text-warningAmber" />
          )}
          <span>{isSeeding ? 'Synthesizing...' : 'Seed 5-Session Demo'}</span>
        </button>
      </div>

      {/* 3 Glass Telemetry Tiles */}
      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-5">
        {/* Tile 1: State Version */}
        <div className="p-4 rounded-2xl bg-cardDark/60 backdrop-blur-md border border-borderSubtle/80 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-accentCyan/10 text-accentCyan">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-textDim uppercase tracking-wider block">
              Active State
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-textLight">{stateVersion}</span>
              <span className="text-xs text-emeraldGreen font-medium">Synced</span>
            </div>
          </div>
        </div>

        {/* Tile 2: Sessions */}
        <div className="p-4 rounded-2xl bg-cardDark/60 backdrop-blur-md border border-borderSubtle/80 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-electricTeal/10 text-electricTeal">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-textDim uppercase tracking-wider block">
              Analyzed Sessions
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-textLight">{totalSessions}</span>
              <span className="text-xs text-textMuted">recorded</span>
            </div>
          </div>
        </div>

        {/* Tile 3: Baseline Maturity */}
        <div className="p-4 rounded-2xl bg-cardDark/60 backdrop-blur-md border border-borderSubtle/80 flex items-center gap-3.5">
          <div
            className={`p-2.5 rounded-xl ${
              hasBaseline
                ? 'bg-emeraldGreen/10 text-emeraldGreen'
                : 'bg-warningAmber/10 text-warningAmber'
            }`}
          >
            {hasBaseline ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-semibold text-textDim uppercase tracking-wider block">
              Baseline Status
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`text-sm font-bold uppercase tracking-wide ${
                  hasBaseline ? 'text-emeraldGreen' : 'text-warningAmber'
                }`}
              >
                {hasBaseline ? 'ESTABLISHED' : 'CALIBRATING'}
              </span>
              <span className="text-[10px] text-textDim">
                ({hasBaseline ? 'N ≥ 3' : `${totalSessions}/3 min`})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="relative pt-4 border-t border-borderSubtle/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-textMuted gap-2">
        <p className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accentCyan animate-ping" />
          <span>
            {overview?.baseline_status_message ||
              'Upload videos or seed sample data to generate personal baselines.'}
          </span>
        </p>
        <span className="font-mono text-textDim">
          Overall Fidelity Score: <strong className="text-accentCyan">{qualityIndex}%</strong>
        </span>
      </div>
    </div>
  );
};
