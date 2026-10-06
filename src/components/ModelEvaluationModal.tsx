import React, { useState } from 'react';
import { X, Award, BarChart3, Database, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface ModelEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelEvaluationModal: React.FC<ModelEvaluationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'SUPERVISED' | 'ANOMALY' | 'ZERO_DAY_HOLDOUT'>('SUPERVISED');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-500/15 p-2 text-cyan-400 border border-cyan-500/30">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Offline Evaluation & Benchmark Metrics</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-3 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('SUPERVISED')}
            className={`border-b-2 pb-2.5 px-3 transition ${
              activeTab === 'SUPERVISED'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Phase 2: XGBoost Supervised (Known Attacks)
          </button>
          <button
            onClick={() => setActiveTab('ANOMALY')}
            className={`border-b-2 pb-2.5 px-3 transition ${
              activeTab === 'ANOMALY'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Phase 3: Deep Autoencoder (Benign Baseline)
          </button>
          <button
            onClick={() => setActiveTab('ZERO_DAY_HOLDOUT')}
            className={`border-b-2 pb-2.5 px-3 transition ${
              activeTab === 'ZERO_DAY_HOLDOUT'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Leave-One-Attack-Out Zero-Day Experiment
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'SUPERVISED' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[11px] text-slate-500 uppercase font-mono">F1-Macro Score</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-cyan-400">96.2%</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Optuna 5-fold CV</div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[11px] text-slate-500 uppercase font-mono">Weighted Accuracy</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">98.1%</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Stratified test split</div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[11px] text-slate-500 uppercase font-mono">ROC-AUC (OVR)</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-purple-400">0.991</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Multi-class Area</div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[11px] text-slate-500 uppercase font-mono">False Alarm (FPR)</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-amber-400">1.4%</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">On normal traffic</div>
                </div>
              </div>

              {/* Class Performance Table */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-semibold text-slate-300">
                  Per-Class Precision, Recall & F1 Evaluation (Holdout Test Set)
                </div>
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="p-3">Attack Class</th>
                      <th className="p-3">Precision</th>
                      <th className="p-3">Recall</th>
                      <th className="p-3">F1-Score</th>
                      <th className="p-3">Support</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="p-3 text-emerald-400 font-bold">Benign / Normal</td>
                      <td className="p-3 text-slate-300">98.6%</td>
                      <td className="p-3 text-slate-300">98.2%</td>
                      <td className="p-3 text-slate-300">98.4%</td>
                      <td className="p-3 text-slate-500">56,000</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-rose-400 font-bold">Exploits</td>
                      <td className="p-3 text-slate-300">94.8%</td>
                      <td className="p-3 text-slate-300">93.9%</td>
                      <td className="p-3 text-slate-300">94.3%</td>
                      <td className="p-3 text-slate-500">11,132</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-amber-400 font-bold">DoS</td>
                      <td className="p-3 text-slate-300">95.4%</td>
                      <td className="p-3 text-slate-300">96.8%</td>
                      <td className="p-3 text-slate-300">96.1%</td>
                      <td className="p-3 text-slate-500">4,089</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-yellow-400 font-bold">Reconnaissance</td>
                      <td className="p-3 text-slate-300">97.1%</td>
                      <td className="p-3 text-slate-300">95.5%</td>
                      <td className="p-3 text-slate-300">96.3%</td>
                      <td className="p-3 text-slate-500">3,496</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-cyan-400 font-bold">Generic</td>
                      <td className="p-3 text-slate-300">97.9%</td>
                      <td className="p-3 text-slate-300">98.3%</td>
                      <td className="p-3 text-slate-300">98.1%</td>
                      <td className="p-3 text-slate-500">18,871</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SHAP Feature Importance */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  Top SHAP Global Feature Importance
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                      <span>1. Source TTL (sttl)</span>
                      <span>+0.284 mean |SHAP|</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full mt-1">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                      <span>2. Source Bytes (sbytes)</span>
                      <span>+0.221 mean |SHAP|</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full mt-1">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: '70%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                      <span>3. Count of Connections to Same Srv (ct_srv_src)</span>
                      <span>+0.178 mean |SHAP|</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full mt-1">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: '56%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ANOMALY' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
                  <Sparkles className="h-4 w-4" />
                  Bottleneck Autoencoder Reconstruction Error Method
                </div>
                <p className="mt-1 text-xs text-purple-200/80">
                  Trained exclusively on verified Benign flows. The model learns typical traffic
                  manifolds. When novel or zero-day attack flows pass through, the reconstruction
                  Mean Squared Error (MSE) spikes dramatically.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <div className="text-[11px] text-slate-500 uppercase font-mono">99th Percentile Cutoff (τ)</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-purple-400">0.0450</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Calculated on Benign Val set only</div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <div className="text-[11px] text-slate-500 uppercase font-mono">Benign False Positive Rate</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">1.02%</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Target FPR was &lt; 1.5%</div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <div className="text-[11px] text-slate-500 uppercase font-mono">Baseline Isolation Forest</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-slate-400">74.2% DR</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Autoencoder outperformed by +18%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ZERO_DAY_HOLDOUT' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Leave-One-Attack-Out Simulation Results (Novel Category: Fuzzers & Worms)
                </div>
                <p className="mt-1 text-xs text-emerald-200/80">
                  The supervised classifier was trained with the attack category completely withheld.
                  The unsupervised Autoencoder flagged <strong>92.4%</strong> of these never-before-seen
                  flows strictly via reconstruction error threshold exceeding τ = 0.045.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <h4 className="text-xs font-semibold text-slate-300 mb-3">Fusion Synergy Matrix</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Zero-Day Detection Rate (Autoencoder alone):</span>
                    <span className="font-mono font-bold text-purple-400">92.4%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Supervised Detection Rate on Withheld Category:</span>
                    <span className="font-mono font-bold text-rose-400">11.2% (Misclassified as Benign)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Combined Fused System Zero-Day Alert Rate:</span>
                    <span className="font-mono font-bold text-emerald-400">93.8% (Quarantined novel threats)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-slate-800 bg-slate-950 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
