import React, { useState, useEffect } from 'react';
import {
  Cpu,
  History,
  ShieldCheck,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { api } from '../api/client';
import { useTwin } from '../context/TwinContext';
import { TwinState } from '../types';
import { extractNumericValue, safeFormatDate } from '../utils/formatters';

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

      {/* Hero Overview */}
      <div className="p-6 md:p-8 rounded-3xl bg-hero-gradient border border-accentCyan/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accentCyan/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-borderSubtle/60">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-extrabold text-textLight font-mono">
                {active?.state_version ? `State v${active.state_version}` : 'v0 (Uninitialized)'}
              </span>
              <span className="px-3 py-1 rounded-full bg-emeraldGreen/15 border border-emeraldGreen/30 text-emeraldGreen text-xs font-bold uppercase tracking-wider">
                Audited & Verified
              </span>
            </div>
            <p className="text-xs text-textMuted max-w-xl leading-relaxed">
              {active?.status_summary ||
                'No movement baseline established yet. Upload sessions or seed demo data to activate digital twin evolution.'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-textDim block">
                Tracked Sessions
              </span>
              <span className="text-2xl font-extrabold text-accentCyan font-mono">
                {active?.total_sessions_tracked || overview?.total_sessions || 0}
              </span>
            </div>
            <div className="text-right pl-4 border-l border-borderSubtle">
              <span className="text-[10px] uppercase font-mono text-textDim block">
                Data Quality Index
              </span>
              <span className="text-2xl font-extrabold text-emeraldGreen font-mono">
                {qualityIndex}%
              </span>
            </div>
          </div>
        </div>

        {/* Current Metrics vs Personal Baseline Comparison */}
        <div>
          <h3 className="text-sm font-bold text-textLight mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accentCyan" />
            <span>Active Baseline Telemetry (10-Session Rolling Window)</span>
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

                return (
                  <div
                    key={key}
                    className="p-4 rounded-2xl bg-cardDark/70 border border-borderSubtle/80 backdrop-blur-md"
                  >
                    <span className="text-[11px] font-bold text-textLight uppercase tracking-wider block truncate">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                      <div>
                        <span className="text-xs text-textDim block">Baseline Median</span>
                        <span className="text-lg font-bold font-mono text-accentCyan">
                          {bMedian !== null ? bMedian.toFixed(1) : '--'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-textDim block">Latest</span>
                        <span className="text-sm font-mono text-textLight">
                          {curVal !== null ? curVal.toFixed(1) : '--'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-borderSubtle/50 flex justify-between text-[10px] text-textDim font-mono">
                      <span>IQR: {bIqr !== null ? bIqr.toFixed(1) : '0.0'}</span>
                      <span className="text-emeraldGreen">N = {bSamples}</span>
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
