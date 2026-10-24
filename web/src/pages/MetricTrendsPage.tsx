import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  Layers,
  Info,
  Calendar,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api/client';
import { TrendItem, MetricHistoryResponse, AnomalyItem } from '../types';
import { TrendChart } from '../components/charts/TrendChart';

export const MetricTrendsPage: React.FC = () => {
  const [availableMetrics] = useState([
    { key: 'trunk_angle_deg', label: 'Trunk Inclination', unit: '°' },
    { key: 'knee_angle_left_deg', label: 'Left Knee Flexion', unit: '°' },
    { key: 'knee_angle_right_deg', label: 'Right Knee Flexion', unit: '°' },
    { key: 'symmetry_index_percent', label: 'Bilateral Symmetry', unit: '%' },
    { key: 'cadence_spm', label: 'Step Cadence', unit: 'spm' },
  ]);

  const [selectedMetric, setSelectedMetric] = useState(availableMetrics[0]);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [history, setHistory] = useState<MetricHistoryResponse | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load trends & anomalies once
  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [trendData, anomalyData] = await Promise.all([
          api.analytics.getTrends(),
          api.analytics.getAnomalies(),
        ]);
        setTrends(trendData);
        setAnomalies(anomalyData);
      } catch (err) {
        console.error('Failed to load trends overview:', err);
      }
    };
    loadOverview();
  }, []);

  // Fetch metric history whenever selectedMetric changes
  useEffect(() => {
    const fetchMetricData = async () => {
      setIsLoading(true);
      try {
        const data = await api.analytics.getMetricHistory(selectedMetric.key);
        setHistory(data);
      } catch (err) {
        console.error('Failed to load metric history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetricData();
  }, [selectedMetric]);

  const currentTrend = trends.find((t) => t.metric_name === selectedMetric.key);

  let trendColor = 'text-textMuted bg-borderSubtle/50 border-borderSubtle';
  if (currentTrend?.trend_label === 'IMPROVING') {
    trendColor = 'text-emeraldGreen bg-emeraldGreen/15 border-emeraldGreen/30';
  } else if (currentTrend?.trend_label === 'DECLINING') {
    trendColor = 'text-warningAmber bg-warningAmber/15 border-warningAmber/30';
  } else if (currentTrend?.trend_label === 'STABLE') {
    trendColor = 'text-accentCyan bg-accentCyan/15 border-accentCyan/30';
  }

  const metricAnomalies = anomalies.filter((a) => a.metric_name === selectedMetric.key);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-textLight">
          Kinematic Trajectory & Trends
        </h2>
        <p className="text-xs text-textMuted mt-1">
          Longitudinal time-series progression compared against personal rolling baseline bands
        </p>
      </div>

      {/* Metric Selector Choice Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {availableMetrics.map((m) => {
          const isSelected = m.key === selectedMetric.key;
          return (
            <button
              key={m.key}
              onClick={() => setSelectedMetric(m)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'bg-accent-gradient text-surfaceDark shadow-neon-cyan active:scale-95'
                  : 'bg-cardDark hover:bg-cardGlass border border-borderSubtle text-textMuted hover:text-textLight'
              }`}
            >
              {m.label} ({m.unit})
            </button>
          );
        })}
      </div>

      {/* Trend Status Banner */}
      <div className="p-6 rounded-3xl bg-cardDark border border-borderSubtle shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-textLight">{selectedMetric.label}</h3>
            {currentTrend && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${trendColor}`}
              >
                {currentTrend.trend_label}
              </span>
            )}
          </div>
          <p className="text-xs text-textMuted font-mono">
            {currentTrend
              ? `Trajectory Slope: ${currentTrend.slope > 0 ? '+' : ''}${currentTrend.slope.toFixed(
                  2
                )}${selectedMetric.unit}/session across ${currentTrend.observation_count} observations`
              : 'Collecting observation points...'}
          </p>
        </div>

        {metricAnomalies.length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-dangerCoral/10 border border-dangerCoral/30 text-dangerCoral text-xs font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{metricAnomalies.length} Variations Flagged</span>
          </div>
        )}
      </div>

      {/* Chart Container Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-cardDark border border-borderSubtle shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accentCyan" />
            <h4 className="text-sm font-bold text-textLight">
              Observed Trajectory vs Baseline Reference Line
            </h4>
          </div>
          <span className="text-xs font-mono text-accentCyan bg-surfaceDark px-2.5 py-1 rounded-lg border border-borderSubtle">
            Unit: {selectedMetric.unit}
          </span>
        </div>

        {isLoading ? (
          <div className="h-72 flex items-center justify-center text-xs text-textMuted font-mono gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-accentCyan" />
            <span>Rendering Recharts trajectory...</span>
          </div>
        ) : history && history.points.length > 0 ? (
          <TrendChart
            points={history.points}
            metricName={selectedMetric.label}
            unit={selectedMetric.unit}
          />
        ) : (
          <div className="h-72 flex items-center justify-center text-xs text-textMuted font-mono">
            Insufficient observation data. Upload videos or seed demo sessions.
          </div>
        )}
      </div>

      {/* Explanatory Methodology Card */}
      <div className="p-6 rounded-2xl bg-cardGlass border border-borderSubtle text-xs text-textMuted space-y-2">
        <h4 className="font-bold text-textLight flex items-center gap-2">
          <Info className="w-4 h-4 text-accentCyan" />
          <span>Analytical Methodology & Trajectory Scoring</span>
        </h4>
        <p className="leading-relaxed">
          • <strong>Robust Baseline Bounds</strong>: Rolling medians and interquartile ranges (IQR)
          are utilized instead of simple means to guarantee resistance to noisy single-frame
          occlusions.
        </p>
        <p className="leading-relaxed">
          • <strong>Biomechanical Polarity</strong>: An "IMPROVING" label indicates movement changes
          aligned with biomechanical efficiency (such as decreased bilateral asymmetry or stable
          trunk angles).
        </p>
        <p className="leading-relaxed">
          • <strong>Red Marker Dots</strong>: Identify observations where Modified Z-score exceeded
          1.75, representing statistical variation relative to your personal historical norm.
        </p>
      </div>
    </div>
  );
};
