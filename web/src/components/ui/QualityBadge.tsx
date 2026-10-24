import React from 'react';

interface QualityBadgeProps {
  score: number; // 0.0 to 1.0 (or 0 to 100)
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({ score }) => {
  const normScore = score > 1.0 ? score : score * 100;

  let colorClasses = 'text-dangerCoral bg-dangerCoral/10 border-dangerCoral/30';
  let dotColor = 'bg-dangerCoral';
  let label = 'LOW QUALITY';

  if (normScore >= 75) {
    colorClasses = 'text-emeraldGreen bg-emeraldGreen/10 border-emeraldGreen/30';
    dotColor = 'bg-emeraldGreen';
    label = 'HIGH FIDELITY';
  } else if (normScore >= 50) {
    colorClasses = 'text-warningAmber bg-warningAmber/10 border-warningAmber/30';
    dotColor = 'bg-warningAmber';
    label = 'MODERATE';
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold tracking-wide uppercase ${colorClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      <span>{label}</span>
      <span className="opacity-70 text-[10px]">({normScore.toFixed(0)}%)</span>
    </div>
  );
};
