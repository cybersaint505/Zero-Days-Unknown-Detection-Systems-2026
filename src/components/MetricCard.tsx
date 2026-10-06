import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  statusColor: 'emerald' | 'cyan' | 'purple' | 'rose' | 'amber';
  badgeText?: string;
  secondaryInfo?: {
    label: string;
    value: string;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  statusColor,
  badgeText,
  secondaryInfo,
}) => {
  const colorStyles = {
    emerald: {
      border: 'border-emerald-500/30',
      bgGlow: 'from-emerald-500/10 via-transparent to-transparent',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      highlight: 'text-emerald-400',
    },
    cyan: {
      border: 'border-cyan-500/30',
      bgGlow: 'from-cyan-500/10 via-transparent to-transparent',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      highlight: 'text-cyan-400',
    },
    purple: {
      border: 'border-purple-500/30',
      bgGlow: 'from-purple-500/10 via-transparent to-transparent',
      iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      highlight: 'text-purple-400',
    },
    rose: {
      border: 'border-rose-500/30',
      bgGlow: 'from-rose-500/10 via-transparent to-transparent',
      iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      highlight: 'text-rose-400',
    },
    amber: {
      border: 'border-amber-500/30',
      bgGlow: 'from-amber-500/10 via-transparent to-transparent',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      highlight: 'text-amber-400',
    },
  }[statusColor];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${colorStyles.border} bg-slate-900/80 backdrop-blur-md p-5 shadow-lg transition-all duration-200 hover:border-slate-600/60 hover:shadow-cyan-950/20`}
    >
      {/* Subtle top edge glow */}
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${colorStyles.bgGlow}`} />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
              {title}
            </span>
            {badgeText && (
              <span
                className={`rounded border px-2 py-0.5 text-[10px] font-medium tracking-wide ${colorStyles.badge}`}
              >
                {badgeText}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white font-mono">
              {value}
            </span>
            {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
          </div>
        </div>

        <div className={`rounded-lg border p-2.5 ${colorStyles.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
        <span className="text-slate-400">{subtitle}</span>

        {trend && (
          <span
            className={`font-mono text-xs font-medium ${
              trend.isPositive ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {trend.value} <span className="text-slate-500">{trend.label}</span>
          </span>
        )}

        {secondaryInfo && (
          <span className="font-mono text-slate-300">
            <span className="text-slate-500">{secondaryInfo.label}: </span>
            {secondaryInfo.value}
          </span>
        )}
      </div>
    </div>
  );
};
