import React from 'react';
import { Play, Pause, Zap, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SimulationControlsProps {
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onInjectZeroDay: () => void;
  onReset: () => void;
  speed: 'NORMAL' | 'BURST';
  onToggleSpeed: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isStreaming,
  onToggleStreaming,
  onInjectZeroDay,
  onReset,
  speed,
  onToggleSpeed,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Simulation Stream Controls:
        </span>
        <button
          onClick={onToggleStreaming}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            isStreaming
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
          }`}
        >
          {isStreaming ? (
            <>
              <Pause className="h-3.5 w-3.5" /> Pause Ingestion
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" /> Resume Ingestion
            </>
          )}
        </button>

        <button
          onClick={onToggleSpeed}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
            speed === 'BURST'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-yellow-400" />
          {speed === 'BURST' ? 'Burst Load (2,800/s)' : 'Normal Load (1,400/s)'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onInjectZeroDay}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:from-purple-500 hover:to-indigo-500 transition active:scale-95"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-200" />
          Inject Zero-Day Attack Flow
        </button>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/70 p-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          title="Reset Telemetry Data"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
