import React from 'react';
import { X, ShieldAlert, Sparkles, CheckCircle2, ArrowRight, Terminal } from 'lucide-react';
import { FlowEvent } from '../types';

interface FlowDetailsModalProps {
  flow: FlowEvent | null;
  onClose: () => void;
}

export const FlowDetailsModal: React.FC<FlowDetailsModalProps> = ({ flow, onClose }) => {
  if (!flow) return null;

  const isZeroDay = flow.decision === 'SUSPECTED_ZERO_DAY';
  const isKnown = flow.decision === 'KNOWN_ATTACK';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${
                isZeroDay
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : isKnown
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isZeroDay ? (
                <Sparkles className="h-5 w-5" />
              ) : isKnown ? (
                <ShieldAlert className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-base font-bold text-white">Flow ID: {flow.id}</h3>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-400">
                  {flow.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {flow.protocol} • {flow.srcIp}:{flow.srcPort} <ArrowRight className="inline h-3 w-3" />{' '}
                {flow.dstIp}:{flow.dstPort} ({flow.service})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Fusion Verdict Breakdown */}
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Dual-Model Decision Breakdown
            </h4>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div className="rounded border border-slate-800/80 bg-slate-900/60 p-3">
                <div className="text-[11px] font-medium text-slate-400">
                  Supervised Classifier (XGBoost)
                </div>
                <div className="mt-1 font-mono text-sm font-bold text-white">
                  {flow.supervisedLabel}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Confidence: {(flow.supervisedConfidence * 100).toFixed(1)}%
                </div>
              </div>

              <div
                className={`rounded border p-3 ${
                  flow.anomalyScore > flow.anomalyThreshold
                    ? 'border-purple-500/40 bg-purple-950/20'
                    : 'border-slate-800/80 bg-slate-900/60'
                }`}
              >
                <div className="text-[11px] font-medium text-slate-400">
                  Deep Autoencoder (Anomaly MSE)
                </div>
                <div
                  className={`mt-1 font-mono text-sm font-bold ${
                    flow.anomalyScore > flow.anomalyThreshold ? 'text-purple-400' : 'text-emerald-400'
                  }`}
                >
                  MSE: {flow.anomalyScore.toFixed(4)}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Threshold: {flow.anomalyThreshold.toFixed(4)}{' '}
                  {flow.anomalyScore > flow.anomalyThreshold ? '(EXCEEDED)' : '(Normal range)'}
                </div>
              </div>
            </div>

            {/* Verdict summary */}
            <div className="mt-3 flex items-center justify-between rounded bg-slate-900 p-2.5 text-xs">
              <span className="text-slate-400 font-medium">Final Fused Verdict:</span>
              <span
                className={`font-mono font-bold px-2.5 py-0.5 rounded ${
                  isZeroDay
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : isKnown
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {flow.decision} ({flow.action})
              </span>
            </div>
          </div>

          {/* Raw Feature Vector Excerpt */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              Preprocessed Flow Features (UNSW-NB15 schema sample)
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="rounded bg-slate-950 p-2 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Duration:</span>
                <span className="text-slate-200">{flow.flowFeatures.duration}s</span>
              </div>
              <div className="rounded bg-slate-950 p-2 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Src Bytes (sbytes):</span>
                <span className="text-slate-200">{flow.flowFeatures.sbytes.toLocaleString()}</span>
              </div>
              <div className="rounded bg-slate-950 p-2 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Dst Bytes (dbytes):</span>
                <span className="text-slate-200">{flow.flowFeatures.dbytes.toLocaleString()}</span>
              </div>
              <div className="rounded bg-slate-950 p-2 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Src TTL (sttl):</span>
                <span className="text-slate-200">{flow.flowFeatures.sttl}</span>
              </div>
              <div className="rounded bg-slate-950 p-2 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Dst TTL (dttl):</span>
                <span className="text-slate-200">{flow.flowFeatures.dttl}</span>
              </div>
              <div className="rounded bg-slate-950 p-2 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Src Load (bps):</span>
                <span className="text-slate-200">{flow.flowFeatures.sload.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-800 bg-slate-950/40 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
