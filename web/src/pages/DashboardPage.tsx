import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Sparkles,
  TrendingUp,
  History,
  Activity,
  Calendar,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { useTwin } from '../context/TwinContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { SessionItem, TrendItem, AnomalyItem } from '../types';
import { TwinStatusCard } from '../components/ui/TwinStatusCard';
import { MetricCard } from '../components/ui/MetricCard';
import { QualityBadge } from '../components/ui/QualityBadge';
import { format } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const { overview, isSeeding, seedDemoProgression, refreshOverview } = useTwin();
  const { athlete } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const [sessionsData, trendsData, anomaliesData] = await Promise.all([
        api.sessions.list(5),
        api.analytics.getTrends(),
        api.analytics.getAnomalies(),
      ]);
      setSessions(sessionsData);
      setTrends(trendsData);
      setAnomalies(anomaliesData);
    } catch (e) {
      console.error('Failed to load dashboard telemetry:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSeedDemo = async () => {
    try {
      await seedDemoProgression();
      await loadDashboardData();
      setSeedSuccessMsg('5-Session synthesized demo history seeded! Baselines & Twin updated to v5.');
      setTimeout(() => setSeedSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(`Demo seeding failed: ${err.message}`);
    }
  };

  // Extract current telemetry metrics from active state
  const currentMetrics = overview?.active_state?.current_metrics || {};
  const baselineSummary = overview?.active_state?.baseline_summary || {};

  // Helper to find trend
  const getTrend = (metric: string) => {
    return trends.find((t) => t.metric_name === metric)?.trend_label;
  };

  return (
    <div className="space-y-8">
      {/* Success Notification Banner */}
      {seedSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emeraldGreen/15 border border-emeraldGreen/30 text-emeraldGreen text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emeraldGreen animate-ping" />
            <span>{seedSuccessMsg}</span>
          </div>
          <button onClick={() => setSeedSuccessMsg(null)} className="opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Hero Digital Twin Status Card */}
      <TwinStatusCard
        overview={overview}
        onSeedDemo={handleSeedDemo}
        isSeeding={isSeeding}
      />

      {/* 2. Quick Action Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Link
          to="/upload"
          className="p-4 rounded-2xl bg-cardDark border border-borderSubtle hover:border-accentCyan/40 hover:shadow-neon-cyan/20 transition-all flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-xl bg-accentCyan/10 text-accentCyan group-hover:scale-110 transition-transform">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-textLight group-hover:text-accentCyan transition-colors">
              Analyze Movement Video
            </h4>
            <span className="text-xs text-textMuted">Upload MP4 & run MediaPipe</span>
          </div>
        </Link>

        <Link
          to="/insights"
          className="p-4 rounded-2xl bg-cardDark border border-borderSubtle hover:border-electricTeal/40 hover:shadow-lg transition-all flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-xl bg-electricTeal/10 text-electricTeal group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-textLight group-hover:text-electricTeal transition-colors">
              Gemini AI Coaching
            </h4>
            <span className="text-xs text-textMuted">Evidence-grounded drills</span>
          </div>
        </Link>

        <Link
          to="/trends"
          className="p-4 rounded-2xl bg-cardDark border border-borderSubtle hover:border-warningAmber/40 hover:shadow-lg transition-all flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-xl bg-warningAmber/10 text-warningAmber group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-textLight group-hover:text-warningAmber transition-colors">
              Variations & Trends
            </h4>
            <span className="text-xs text-textMuted">
              {anomalies.length} variations flagged
            </span>
          </div>
        </Link>
      </div>

      {/* 3. Biomechanical Baseline Telemetry Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accentCyan" />
            <h3 className="text-base font-bold text-textLight tracking-tight">
              Biomechanical Telemetry
            </h3>
          </div>
          <Link
            to="/trends"
            className="text-xs font-semibold text-accentCyan hover:underline flex items-center gap-1"
          >
            <span>Full Trajectories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Trunk Inclination"
            metricKey="trunk_angle_deg"
            value={currentMetrics.trunk_angle_deg ?? currentMetrics.trunk_inclination_angle ?? currentMetrics.trunk}
            unit="°"
            baselineValue={baselineSummary.trunk_angle_deg?.median ?? baselineSummary.trunk_inclination_angle?.median ?? baselineSummary.trunk?.median}
            trendLabel={getTrend('trunk_angle_deg') ?? getTrend('trunk_inclination_angle')}
            onClick={() => navigate('/trends')}
          />
          <MetricCard
            title="Left Knee Flexion"
            metricKey="knee_angle_left_deg"
            value={currentMetrics.knee_angle_left_deg ?? currentMetrics.knee_flexion_left ?? currentMetrics.lk}
            unit="°"
            baselineValue={baselineSummary.knee_angle_left_deg?.median ?? baselineSummary.knee_flexion_left?.median ?? baselineSummary.lk?.median}
            trendLabel={getTrend('knee_angle_left_deg') ?? getTrend('knee_flexion_left')}
            onClick={() => navigate('/trends')}
          />
          <MetricCard
            title="Right Knee Flexion"
            metricKey="knee_angle_right_deg"
            value={currentMetrics.knee_angle_right_deg ?? currentMetrics.knee_flexion_right ?? currentMetrics.rk}
            unit="°"
            baselineValue={baselineSummary.knee_angle_right_deg?.median ?? baselineSummary.knee_flexion_right?.median ?? baselineSummary.rk?.median}
            trendLabel={getTrend('knee_angle_right_deg') ?? getTrend('knee_flexion_right')}
            onClick={() => navigate('/trends')}
          />
          <MetricCard
            title="Bilateral Symmetry"
            metricKey="symmetry_index_percent"
            value={currentMetrics.symmetry_index_percent ?? currentMetrics.bilateral_knee_symmetry_index ?? currentMetrics.bilateral_symmetry_index ?? currentMetrics.si}
            unit="%"
            baselineValue={baselineSummary.symmetry_index_percent?.median ?? baselineSummary.bilateral_knee_symmetry_index?.median ?? baselineSummary.bilateral_symmetry_index?.median ?? baselineSummary.si?.median}
            trendLabel={getTrend('symmetry_index_percent') ?? getTrend('bilateral_knee_symmetry_index') ?? getTrend('bilateral_symmetry_index')}
            onClick={() => navigate('/trends')}
          />
        </div>
      </div>

      {/* 4. Recent Recorded Sessions Table */}
      <div className="p-6 rounded-3xl bg-cardDark border border-borderSubtle">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-electricTeal" />
            <h3 className="text-base font-bold text-textLight">Recent Movement Sessions</h3>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-accentCyan hover:underline flex items-center gap-1"
          >
            <span>View All ({overview?.total_sessions || 0})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="py-10 text-center text-xs text-textMuted font-mono">
            No training sessions recorded yet. Upload a video or seed demo data to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderSubtle text-textDim uppercase tracking-wider font-mono">
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold">Video File</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Quality</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle/60">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-cardGlass/40 transition-colors">
                    <td className="py-3.5 font-medium text-textLight">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-textDim" />
                        <span>{format(new Date(s.recorded_at), 'MMM dd, yyyy • HH:mm')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-textMuted">
                      <div className="flex items-center gap-2">
                        <span>{s.video_filename}</span>
                        {s.is_demo_data && (
                          <span className="px-1.5 py-0.5 rounded bg-warningAmber/15 text-warningAmber text-[9px] font-bold border border-warningAmber/30">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                          s.processing_status === 'COMPLETED'
                            ? 'text-emeraldGreen bg-emeraldGreen/10 border border-emeraldGreen/20'
                            : s.processing_status === 'PROCESSING'
                            ? 'text-accentCyan bg-accentCyan/10 border border-accentCyan/20 animate-pulse'
                            : 'text-warningAmber bg-warningAmber/10 border border-warningAmber/20'
                        }`}
                      >
                        {s.processing_status}
                      </span>
                    </td>
                    <td className="py-3.5">
                      {s.quality_score != null ? (
                        <QualityBadge score={s.quality_score} />
                      ) : (
                        <span className="text-textDim">--</span>
                      )}
                    </td>
                    <td className="py-3.5 font-mono text-textMuted">
                      {s.duration_sec ? `${s.duration_sec.toFixed(1)}s` : '--'}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/sessions/${s.id}`}
                        className="inline-flex items-center gap-1 text-accentCyan hover:underline font-semibold"
                      >
                        <span>Telemetry</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
