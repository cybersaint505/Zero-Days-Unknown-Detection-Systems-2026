import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MetricTrendPoint } from '../types';
import { TrendingUp, Sparkles, ShieldAlert, Activity, Clock } from 'lucide-react';

interface ThreatTrendsSectionProps {
  trends: MetricTrendPoint[];
}

type ViewMode = 'THREAT_BREAKDOWN' | 'THREATS_VS_ANOMALY' | 'THROUGHPUT';

export const ThreatTrendsSection: React.FC<ThreatTrendsSectionProps> = ({ trends }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('THREAT_BREAKDOWN');

  // Calculate dynamic summary stats over the 10-minute window
  const maxThreats = Math.max(...trends.map((t) => t.activeThreats));
  const peakTime = trends.find((t) => t.activeThreats === maxThreats)?.time || '13:39';
  const latestZeroDays = trends[trends.length - 1].zeroDayThreats ?? 9;
  const initialZeroDays = trends[0].zeroDayThreats ?? 5;
  const zeroDayGrowth = ((latestZeroDays - initialZeroDays) / initialZeroDays) * 100;

  return (
    <section
      aria-label="Threat Trends Over the Last 10 Minutes"
      className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-5 shadow-lg"
    >
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-white">
              Threat Trends (Last 10 Minutes)
            </h2>
            <span className="flex items-center gap-1 rounded bg-slate-800/90 px-2 py-0.5 text-[11px] font-mono text-slate-400 border border-slate-700/60">
              <Clock className="h-3 w-3 text-cyan-400" />
              13:33 – 13:42 (10-min window)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time Recharts telemetry monitoring active threat velocity, zero-day anomaly spikes, and flow throughput.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 self-start lg:self-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('THREAT_BREAKDOWN')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition ${
              viewMode === 'THREAT_BREAKDOWN'
                ? 'bg-purple-900/50 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3 w-3 text-purple-400" />
            Threats Breakdown
          </button>
          <button
            onClick={() => setViewMode('THREATS_VS_ANOMALY')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition ${
              viewMode === 'THREATS_VS_ANOMALY'
                ? 'bg-rose-900/50 text-rose-200 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="h-3 w-3 text-rose-400" />
            Threats vs Anomaly %
          </button>
          <button
            onClick={() => setViewMode('THROUGHPUT')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition ${
              viewMode === 'THROUGHPUT'
                ? 'bg-cyan-900/50 text-cyan-200 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-3 w-3 text-cyan-400" />
            Throughput (pkts/s)
          </button>
        </div>
      </div>

      {/* Mini Trend Quick Stat Highlights */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Window Peak Threat Load
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5 font-mono">
            <span className="text-base font-bold text-rose-400">{maxThreats} threats</span>
            <span className="text-[10px] text-slate-400">@ {peakTime}</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Zero-Day Influx Trend
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5 font-mono">
            <span className="text-base font-bold text-purple-400">+{zeroDayGrowth.toFixed(0)}%</span>
            <span className="text-[10px] text-purple-300">from 10m ago</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Current Anomaly Rate
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5 font-mono">
            <span className="text-base font-bold text-amber-400">
              {trends[trends.length - 1].anomalyRate}%
            </span>
            <span className="text-[10px] text-slate-400">MSE &gt; τ</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Current Flow Rate
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5 font-mono">
            <span className="text-base font-bold text-cyan-400">
              {trends[trends.length - 1].throughput}
            </span>
            <span className="text-[10px] text-slate-400">flows/s</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="mt-4 h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'THREAT_BREAKDOWN' ? (
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorKnown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorZeroDay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.8} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={32}
                formatter={(val) => (
                  <span className="text-xs text-slate-300 font-medium">{val}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="knownThreats"
                name="Known Signature Attacks"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorKnown)"
              />
              <Area
                type="monotone"
                dataKey="zeroDayThreats"
                name="Suspected Zero-Day Threats"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorZeroDay)"
              />
            </AreaChart>
          ) : viewMode === 'THREATS_VS_ANOMALY' ? (
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.8} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                yAxisId="left"
                stroke="#f43f5e"
                tick={{ fill: '#f43f5e', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#eab308"
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: '#eab308', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={32}
                formatter={(val) => (
                  <span className="text-xs text-slate-300 font-medium">{val}</span>
                )}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="activeThreats"
                name="Total Active Threats"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorActive)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="anomalyRate"
                name="Anomaly Detection Rate (%)"
                stroke="#eab308"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAnomaly)"
              />
            </AreaChart>
          ) : (
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
              <defs>
                <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.8} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#06b6d4"
                tick={{ fill: '#06b6d4', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={32}
                formatter={(val) => (
                  <span className="text-xs text-slate-300 font-medium">{val}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="throughput"
                name="Ingestion Flow Rate (pkts/sec)"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorThroughput)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
};

// Custom Cyber SOC Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data: MetricTrendPoint = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md text-xs font-mono space-y-1.5 min-w-[200px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-slate-400">
          <span>Timestamp</span>
          <span className="text-white font-bold">{label}</span>
        </div>
        <div className="flex items-center justify-between text-rose-400">
          <span>Active Threats:</span>
          <span className="font-bold">{data.activeThreats}</span>
        </div>
        {data.zeroDayThreats !== undefined && (
          <div className="flex items-center justify-between text-purple-400">
            <span>Zero-Day Novel:</span>
            <span className="font-bold">{data.zeroDayThreats}</span>
          </div>
        )}
        {data.knownThreats !== undefined && (
          <div className="flex items-center justify-between text-rose-300">
            <span>Known Signatures:</span>
            <span className="font-bold">{data.knownThreats}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-amber-300">
          <span>Anomaly Rate:</span>
          <span className="font-bold">{data.anomalyRate}%</span>
        </div>
        <div className="flex items-center justify-between text-cyan-400 border-t border-slate-800 pt-1">
          <span>Throughput:</span>
          <span className="font-bold">{data.throughput.toLocaleString()} pkts/s</span>
        </div>
      </div>
    );
  }
  return null;
};
