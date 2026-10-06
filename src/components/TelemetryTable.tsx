import React, { useState } from 'react';
import { FlowEvent } from '../types';
import { ShieldAlert, Sparkles, CheckCircle2, Eye, Filter } from 'lucide-react';

interface TelemetryTableProps {
  flows: FlowEvent[];
  onSelectFlow: (flow: FlowEvent) => void;
}

export const TelemetryTable: React.FC<TelemetryTableProps> = ({ flows, onSelectFlow }) => {
  const [filter, setFilter] = useState<'ALL' | 'ZERO_DAY' | 'KNOWN' | 'BENIGN'>('ALL');

  const filteredFlows = flows.filter((f) => {
    if (filter === 'ZERO_DAY') return f.decision === 'SUSPECTED_ZERO_DAY';
    if (filter === 'KNOWN') return f.decision === 'KNOWN_ATTACK';
    if (filter === 'BENIGN') return f.decision === 'BENIGN';
    return true;
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md overflow-hidden">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 p-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white text-sm">Real-Time Ingestion & Fusion Telemetry</h3>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400 border border-emerald-500/20">
              STREAM INGESTION ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time inference queue stream from Redis broker with simultaneous dual-model evaluation.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`rounded px-2.5 py-1 font-medium transition ${
              filter === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Flows ({flows.length})
          </button>
          <button
            onClick={() => setFilter('ZERO_DAY')}
            className={`flex items-center gap-1 rounded px-2.5 py-1 font-medium transition ${
              filter === 'ZERO_DAY'
                ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
                : 'text-purple-400 hover:text-purple-300'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            Zero-Day ({flows.filter((f) => f.decision === 'SUSPECTED_ZERO_DAY').length})
          </button>
          <button
            onClick={() => setFilter('KNOWN')}
            className={`flex items-center gap-1 rounded px-2.5 py-1 font-medium transition ${
              filter === 'KNOWN'
                ? 'bg-rose-900/50 text-rose-300 border border-rose-500/30'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            <ShieldAlert className="h-3 w-3" />
            Known Attacks ({flows.filter((f) => f.decision === 'KNOWN_ATTACK').length})
          </button>
          <button
            onClick={() => setFilter('BENIGN')}
            className={`rounded px-2.5 py-1 font-medium transition ${
              filter === 'BENIGN'
                ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            Benign ({flows.filter((f) => f.decision === 'BENIGN').length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Connection (Src -&gt; Dst)</th>
              <th className="py-3 px-4">Proto / Svc</th>
              <th className="py-3 px-4">Supervised Classifier</th>
              <th className="py-3 px-4">Autoencoder MSE</th>
              <th className="py-3 px-4">Fused Verdict</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredFlows.map((flow) => {
              const isZeroDay = flow.decision === 'SUSPECTED_ZERO_DAY';
              const isKnown = flow.decision === 'KNOWN_ATTACK';
              const isBenign = flow.decision === 'BENIGN';

              return (
                <tr
                  key={flow.id}
                  onClick={() => onSelectFlow(flow)}
                  className={`cursor-pointer transition hover:bg-slate-800/40 ${
                    isZeroDay ? 'bg-purple-950/10' : isKnown ? 'bg-rose-950/10' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {flow.timestamp}
                  </td>
                  <td className="py-3 px-4 text-slate-200 whitespace-nowrap">
                    <span className="text-slate-300">{flow.srcIp}</span>:{flow.srcPort}
                    <span className="text-slate-500 mx-1.5">-&gt;</span>
                    <span className="text-slate-300">{flow.dstIp}</span>:{flow.dstPort}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                      {flow.protocol}
                    </span>{' '}
                    <span className="text-slate-400">{flow.service}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`font-semibold ${
                        isKnown ? 'text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      {flow.supervisedLabel}
                    </span>
                    <span className="text-slate-500 text-[10px] ml-1">
                      ({(flow.supervisedConfidence * 100).toFixed(0)}%)
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`font-bold ${
                        flow.anomalyScore > flow.anomalyThreshold
                          ? 'text-purple-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {flow.anomalyScore.toFixed(4)}
                    </span>
                    <span className="text-slate-600 text-[10px] ml-1">
                      (τ:{flow.anomalyThreshold})
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isZeroDay ? (
                      <span className="inline-flex items-center gap-1 rounded bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                        <Sparkles className="h-2.5 w-2.5" />
                        SUSPECTED ZERO-DAY
                      </span>
                    ) : isKnown ? (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                        <ShieldAlert className="h-2.5 w-2.5" />
                        KNOWN ATTACK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        BENIGN
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        flow.action === 'BLOCK'
                          ? 'bg-rose-900/60 text-rose-200 border border-rose-700/50'
                          : flow.action === 'QUARANTINE'
                          ? 'bg-purple-900/60 text-purple-200 border border-purple-700/50'
                          : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40'
                      }`}
                    >
                      {flow.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFlow(flow);
                      }}
                      className="rounded bg-slate-800 p-1 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                      title="Inspect Flow Vectors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
