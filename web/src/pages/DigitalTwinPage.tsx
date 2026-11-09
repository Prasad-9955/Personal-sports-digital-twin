import React, { useState, useEffect } from 'react';
import {
  Cpu,
  History,
  ShieldCheck,
  TrendingUp,
  Loader2,
  Activity,
  Layers,
  Database,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { api } from '../api/client';
import { useTwin } from '../context/TwinContext';
import { TwinState } from '../types';
import { extractNumericValue, safeFormatDate } from '../utils/formatters';
import hologramImage from '../assets/digital_twin_hologram.png';

export const DigitalTwinPage: React.FC = () => {
  const { overview } = useTwin();
  const [history, setHistory] = useState<TwinState[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const data = await api.twin.getHistory();
        if (Array.isArray(data)) {
          setHistory(data);
        }
      } catch (err) {
        console.error('Failed to load twin history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const active = overview?.active_state;
  const baselines = (active?.baseline_summary && typeof active.baseline_summary === 'object')
    ? active.baseline_summary
    : {};
  const current = (active?.current_metrics && typeof active.current_metrics === 'object')
    ? active.current_metrics
    : {};

  const rawQuality = extractNumericValue(active?.data_quality_index);
  const qualityIndex = rawQuality != null
    ? (rawQuality > 1.0 ? rawQuality : rawQuality * 100).toFixed(0)
    : '--';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-accentCyan/15 text-accentCyan border border-accentCyan/30">
            <Cpu className="w-4 h-4" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-textLight">
            Persistent Digital Twin State
          </h2>
        </div>
        <p className="text-xs text-textMuted">
          Mathematically sound, immutable longitudinal representation of the athlete's movement mechanics
        </p>
      </div>

      {/* Hero Overview & Digital Human Representation Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-cardDark border border-accentCyan/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accentCyan/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-electricTeal/10 blur-3xl pointer-events-none rounded-full" />

        {/* Digital Human Twin Visualization Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-center">
          {/* Holographic Silhouette Visual */}
          <div className="lg:col-span-5 relative flex items-center justify-center p-4 rounded-3xl bg-surfaceDark/80 border border-borderSubtle overflow-hidden group">
            <div className="absolute inset-0 bg-radial-gradient from-accentCyan/15 via-transparent to-transparent pointer-events-none" />
            <img
              src={hologramImage}
              alt="Digital Human Twin Hologram"
              className="w-full max-h-72 object-contain filter drop-shadow-neon-cyan transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-cardDark/90 backdrop-blur-md border border-borderSubtle flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-accentCyan">
                <span className="w-2 h-2 rounded-full bg-accentCyan animate-pulse" />
                33-Node BlazePose Mesh
              </span>
              <span className="text-textDim">Sagittal Projection</span>
            </div>
          </div>

          {/* Twin Metadata & State Diagnostics */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-3xl font-extrabold text-textLight font-mono">
                {active?.state_version ? `Twin State v${active.state_version}` : 'v0 (Uninitialized)'}
              </span>
              <span className="px-3 py-1 rounded-full bg-accentCyan/15 border border-accentCyan/30 text-accentCyan text-xs font-bold uppercase tracking-wider">
                Statistical Baseline Model
              </span>
            </div>

            <p className="text-xs text-textMuted leading-relaxed">
              {active?.status_summary ||
                'Personal movement baseline established using parametric central tendencies (median) and interquartile dispersion (IQR) across authenticated video sessions.'}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-surfaceDark/60 border border-borderSubtle">
                <span className="text-[10px] uppercase font-mono text-textDim block">
                  Tracked Sessions
                </span>
                <span className="text-xl font-extrabold text-accentCyan font-mono">
                  {active?.total_sessions_tracked || overview?.total_sessions || 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surfaceDark/60 border border-borderSubtle">
                <span className="text-[10px] uppercase font-mono text-textDim block">
                  Data Quality
                </span>
                <span className="text-xl font-extrabold text-emeraldGreen font-mono">
                  {qualityIndex}%
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surfaceDark/60 border border-borderSubtle">
                <span className="text-[10px] uppercase font-mono text-textDim block">
                  Last State Update
                </span>
                <span className="text-xs font-bold text-textLight block truncate mt-1">
                  {active?.created_at ? safeFormatDate(active.created_at, 'MMM dd, yyyy') : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Metrics vs Personal Baseline Comparison */}
        <div>
          <h3 className="text-sm font-bold text-textLight mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accentCyan" />
            <span>Active Baseline Telemetry vs Latest Observed Measurement</span>
          </h3>

          {Object.keys(baselines).length === 0 ? (
            <div className="p-4 rounded-2xl bg-cardDark/60 border border-borderSubtle text-xs text-textMuted font-mono">
              Insufficient sessions (minimum 3 required) to compute mathematical baseline IQR.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(baselines).map(([key, b]: [string, any]) => {
                const curVal = extractNumericValue(current[key]);
                const bMedian = extractNumericValue(b?.median ?? b?.baseline_median ?? b?.baseline_value);
                const bIqr = extractNumericValue(b?.iqr ?? b?.dispersion_iqr);
                const bSamples = b?.samples ?? b?.sample_count ?? 0;
                const delta = (curVal !== null && bMedian !== null) ? (curVal - bMedian) : null;

                return (
                  <div
                    key={key}
                    className="p-4 rounded-2xl bg-cardDark/80 border border-borderSubtle/80 backdrop-blur-md hover:border-accentCyan/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-textLight uppercase tracking-wider block truncate">
                        {key.replace(/_/g, ' ')}
                      </span>
                      {delta !== null && (
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            Math.abs(delta) < 0.1
                              ? 'bg-slate-700 text-slate-300'
                              : delta > 0
                              ? 'bg-emeraldGreen/15 text-emeraldGreen'
                              : 'bg-accentCyan/15 text-accentCyan'
                          }`}
                        >
                          {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between mt-2">
                      <div>
                        <span className="text-[10px] text-textDim block">Baseline Median</span>
                        <span className="text-lg font-bold font-mono text-accentCyan">
                          {bMedian !== null ? bMedian.toFixed(1) : '--'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-textDim block">Latest</span>
                        <span className="text-sm font-mono font-semibold text-textLight">
                          {curVal !== null ? curVal.toFixed(1) : '--'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-borderSubtle/50 flex justify-between text-[10px] text-textDim font-mono">
                      <span>IQR: {bIqr !== null ? bIqr.toFixed(1) : '0.0'}</span>
                      <span className="text-emeraldGreen">N = {bSamples} Sessions</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* State Machine Version History Table */}
      <div className="p-6 md:p-8 rounded-3xl bg-cardDark border border-borderSubtle shadow-xl">
        <h3 className="text-base font-bold text-textLight mb-1 flex items-center gap-2">
          <History className="w-4 h-4 text-electricTeal" />
          <span>State Machine Evolution Log</span>
        </h3>
        <p className="text-xs text-textMuted mb-6">
          Every processed session produces an immutable, auditable state snapshot.
        </p>

        {isLoading ? (
          <div className="py-12 flex items-center justify-center text-xs text-textMuted font-mono gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-accentCyan" />
            <span>Fetching state progression history...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-textMuted font-mono">
            No twin version snapshots recorded yet. Upload sessions or seed demo data to populate history.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderSubtle bg-cardGlass/30 text-textDim uppercase tracking-wider font-mono">
                  <th className="py-3 px-4 font-semibold">Version</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Cumulative Sessions</th>
                  <th className="py-3 px-4 font-semibold">Quality Index</th>
                  <th className="py-3 px-4 font-semibold">Status Diagnostic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle/60">
                {history.map((h) => {
                  const qIdx = extractNumericValue(h.data_quality_index);
                  return (
                    <tr key={h.id} className="hover:bg-cardGlass/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-accentCyan">
                        v{h.state_version}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-textLight">
                        {safeFormatDate(h.created_at, 'MMM dd, yyyy • HH:mm:ss')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-textMuted">
                        {h.total_sessions_tracked}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emeraldGreen font-semibold">
                        {qIdx !== null ? `${(qIdx > 1.0 ? qIdx : qIdx * 100).toFixed(0)}%` : '--'}
                      </td>
                      <td className="py-3.5 px-4 text-textMuted max-w-md truncate">
                        {h.status_summary || 'Normal baseline tracking'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Biomechanical Limitations & Disclaimers */}
      <div className="p-6 rounded-2xl bg-cardGlass/60 border border-borderSubtle text-xs text-textMuted space-y-2">
        <h4 className="font-bold text-textLight flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accentCyan" />
          <span>Biomechanical Modeling & Academic Boundaries</span>
        </h4>
        <p className="leading-relaxed">
          • <strong>2D Kinematic Projections</strong>: Angles (trunk inclination and knee flexion)
          are computed from 2D pixel coordinates projected on the sagittal plane. Perspective variation
          may introduce minor differences compared to 3D optoelectronic motion capture.
        </p>
        <p className="leading-relaxed">
          • <strong>Non-Medical Classification</strong>: Statistical variations (Modified Z-score &gt; 1.75
          or Isolation Forest flags) represent mathematical deviation from the athlete's personal
          historical distribution, NOT physical pathology or medical injury.
        </p>
      </div>
    </div>
  );
};
