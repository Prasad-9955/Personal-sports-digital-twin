import React from 'react';
import { Activity, ArrowUpRight, ArrowDownRight, Minus, Gauge, Compass, Zap } from 'lucide-react';
import { extractNumericValue } from '../../utils/formatters';

interface MetricCardProps {
  title: string;
  metricKey: string;
  value: any; // Safely handle number, null, or { value: number }
  unit: string;
  baselineValue?: any;
  trendLabel?: string;
  confidence?: number;
  sampleCount?: number;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  metricKey,
  value,
  unit,
  baselineValue,
  trendLabel,
  confidence,
  sampleCount,
  onClick,
}) => {
  // Determine telemetry icon
  const getIcon = () => {
    const k = metricKey.toLowerCase();
    if (k.includes('trunk')) return Compass;
    if (k.includes('knee')) return Activity;
    if (k.includes('cadence')) return Gauge;
    if (k.includes('symmetry')) return Zap;
    return Activity;
  };
  const Icon = getIcon();

  const numValue = extractNumericValue(value);
  const numBaseline = extractNumericValue(baselineValue);

  // Calculate delta if baseline is present
  const hasDelta = numValue !== null && numBaseline !== null;
  const delta = hasDelta ? numValue! - numBaseline! : null;
  const deltaPositive = delta !== null && delta >= 0;

  // Determine trend badge color
  let trendColor = 'text-textMuted bg-borderSubtle/50 border-borderSubtle';
  if (trendLabel === 'IMPROVING') {
    trendColor = 'text-emeraldGreen bg-emeraldGreen/15 border-emeraldGreen/30';
  } else if (trendLabel === 'DECLINING') {
    trendColor = 'text-warningAmber bg-warningAmber/15 border-warningAmber/30';
  } else if (trendLabel === 'STABLE') {
    trendColor = 'text-accentCyan bg-accentCyan/15 border-accentCyan/30';
  }

  return (
    <div
      onClick={onClick}
      className={`group relative p-5 rounded-2xl bg-cardDark border border-borderSubtle hover:border-accentCyan/40 transition-all duration-300 shadow-lg hover:shadow-neon-cyan/20 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-accentCyan/10 border border-accentCyan/20 text-accentCyan group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-textLight tracking-tight group-hover:text-accentCyan transition-colors">
              {title}
            </h4>
            <span className="text-[11px] text-textDim uppercase font-mono tracking-wider">
              {metricKey.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {trendLabel && (
          <span
            className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${trendColor}`}
          >
            {trendLabel}
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-extrabold text-textLight tracking-tight font-mono">
          {numValue !== null ? numValue.toFixed(1) : '--'}
        </span>
        <span className="text-sm font-semibold text-textMuted">{unit}</span>
      </div>

      {/* Delta & Baseline Comparison */}
      <div className="flex items-center justify-between pt-3 border-t border-borderSubtle/80 text-xs">
        {hasDelta ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                deltaPositive
                  ? 'text-accentCyan bg-accentCyan/10'
                  : 'text-warningAmber bg-warningAmber/10'
              }`}
            >
              {deltaPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {deltaPositive ? '+' : ''}
              {delta!.toFixed(1)}
              {unit}
            </span>
            <span className="text-textDim text-[11px]">vs baseline ({numBaseline!.toFixed(1)})</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-textDim text-[11px]">
            <Minus className="w-3 h-3" />
            <span>Calibrating baseline</span>
          </div>
        )}

        {confidence !== undefined && (
          <span className="text-[11px] font-mono text-emeraldGreen">
            {(confidence * 100).toFixed(0)}% conf
          </span>
        )}
      </div>
    </div>
  );
};
