import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { MetricHistoryPoint } from '../../types';
import { format } from 'date-fns';

interface TrendChartProps {
  points: MetricHistoryPoint[];
  metricName: string;
  unit: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ points, metricName, unit }) => {
  if (!points || points.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-textMuted font-mono">
        No observation points available for {metricName}.
      </div>
    );
  }

  // Format data for Recharts
  const chartData = points.map((p, idx) => {
    let dateLabel = `S${idx + 1}`;
    try {
      dateLabel = format(new Date(p.recorded_at), 'MMM dd');
    } catch {
      dateLabel = `S${idx + 1}`;
    }
    return {
      sessionIdx: idx + 1,
      dateLabel,
      value: p.metric_value,
      baseline: p.baseline_value ?? null,
      baselineLower: p.baseline_lower ?? null,
      baselineUpper: p.baseline_upper ?? null,
      isAnomaly: p.is_anomaly,
      confidence: p.confidence,
    };
  });

  const latestBaseline = points.find((p) => p.baseline_value != null)?.baseline_value;

  // Custom Dot renderer for anomaly highlights
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isAnomaly) {
      return (
        <svg key={`dot-${payload.sessionIdx}`} x={cx - 6} y={cy - 6} width={12} height={12}>
          <circle cx={6} cy={6} r={5} fill="#EF4444" stroke="#FFFFFF" strokeWidth={2} />
        </svg>
      );
    }
    return (
      <circle
        key={`dot-${payload.sessionIdx}`}
        cx={cx}
        cy={cy}
        r={3.5}
        fill="#00F2FE"
        stroke="#0A0E17"
        strokeWidth={1.5}
      />
    );
  };

  return (
    <div className="w-full h-72 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="metricAreaGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#00F2FE" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="baselineBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4FACFE" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#4FACFE" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />

          <XAxis
            dataKey="dateLabel"
            stroke="#64748B"
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#1E293B' }}
          />
          <YAxis
            stroke="#64748B"
            tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={{ stroke: '#1E293B' }}
            domain={['auto', 'auto']}
          />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="p-3 rounded-xl bg-cardDark/95 border border-borderSubtle shadow-xl backdrop-blur-md text-xs">
                    <p className="font-semibold text-textLight mb-1.5 flex items-center justify-between gap-4">
                      <span>{data.dateLabel}</span>
                      <span className="text-[10px] text-textDim font-mono">
                        Session #{data.sessionIdx}
                      </span>
                    </p>
                    <div className="flex items-center justify-between gap-3 text-sm font-mono mb-1">
                      <span className="text-textMuted">Observed:</span>
                      <span className="font-bold text-accentCyan">
                        {data.value.toFixed(1)} {unit}
                      </span>
                    </div>
                    {data.baseline != null && (
                      <div className="flex items-center justify-between gap-3 text-xs font-mono text-textMuted mb-1">
                        <span>Baseline:</span>
                        <span>
                          {data.baseline.toFixed(1)} {unit}
                        </span>
                      </div>
                    )}
                    {data.isAnomaly && (
                      <div className="mt-2 pt-1.5 border-t border-dangerCoral/30 text-[11px] text-dangerCoral font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-dangerCoral" />
                        <span>Statistical Deviation Detected</span>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Area fill for observed trajectory */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00F2FE"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#metricAreaGlow)"
            dot={renderCustomDot}
            activeDot={{ r: 6, fill: '#00F2FE', stroke: '#FFFFFF', strokeWidth: 2 }}
          />

          {/* Baseline reference line if established */}
          {latestBaseline != null && (
            <ReferenceLine
              y={latestBaseline}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Baseline (${latestBaseline.toFixed(1)}${unit})`,
                fill: '#F59E0B',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
