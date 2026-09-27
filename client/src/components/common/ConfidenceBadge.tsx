import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number; // 0-1 or 0-100
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ score, showIcon = true, size = 'sm' }) => {
  const percentage = score <= 1 ? Math.round(score * 100) : Math.round(score);

  let style = 'bg-emerald-50 text-emerald-700 border-emerald-300';
  let icon = <ShieldCheck className="w-3.5 h-3.5 mr-1" />;
  let label = 'High Confidence';

  if (percentage < 70) {
    style = 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse';
    icon = <AlertOctagon className="w-3.5 h-3.5 mr-1" />;
    label = 'Low Confidence (<70%)';
  } else if (percentage < 90) {
    style = 'bg-amber-50 text-amber-700 border-amber-300';
    icon = <AlertTriangle className="w-3.5 h-3.5 mr-1" />;
    label = 'Medium (70-89%)';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5 font-semibold',
  };

  return (
    <span
      title={`${label} - Score: ${percentage}%`}
      className={`inline-flex items-center font-medium border rounded-full ${style} ${sizeClasses[size]}`}
    >
      {showIcon && icon}
      {percentage}%
    </span>
  );
};
