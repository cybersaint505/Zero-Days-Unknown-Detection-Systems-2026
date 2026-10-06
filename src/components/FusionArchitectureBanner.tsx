import React from 'react';
import { Layers, ShieldAlert, Cpu, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface FusionArchitectureBannerProps {
  anomalyThreshold: number;
  supervisedF1Macro: number;
}

export const FusionArchitectureBanner: React.FC<FusionArchitectureBannerProps> = ({
  anomalyThreshold,
  supervisedF1Macro,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
              <Layers className="h-3 w-3" />
              HYBRID DEFENSE ARCHITECTURE
            </span>
            <span className="text-xs text-slate-400">UNSW-NB15 Benchmark Stream</span>
          </div>
          <h2 className="mt-1 text-base font-semibold text-white">
            Dual-Engine Fusion: Supervised Classifier + Deep Autoencoder Anomaly Detector
          </h2>
          <p className="mt-0.5 text-xs text-slate-400 max-w-3xl">
            Flows are simultaneously evaluated by the multi-class supervised model for signature attacks
            and a bottleneck Autoencoder for zero-day out-of-distribution deviations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-right">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
              Supervised F1-Macro
            </div>
            <div className="font-mono text-sm font-bold text-emerald-400">
              {supervisedF1Macro}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-right">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
              Autoencoder MSE Cutoff
            </div>
            <div className="font-mono text-sm font-bold text-purple-400">
              τ = {anomalyThreshold}
            </div>
          </div>
        </div>
      </div>

      {/* Logic Pipeline Visualizer */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* Step 1 */}
        <div className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
          <div className="rounded bg-cyan-500/10 p-1.5 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200">1. Feature Preprocessing</div>
            <div className="mt-0.5 text-[11px] text-slate-400">
              RobustScaler + OneHot on 42 network flow dimensions.
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
          <div className="rounded bg-emerald-500/10 p-1.5 text-emerald-400 border border-emerald-500/20 shrink-0">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200">2. Supervised XGBoost</div>
            <div className="mt-0.5 text-[11px] text-slate-400">
              If confidence &gt; 0.85 on known signature -&gt; Flag Known Attack.
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-2.5 rounded-lg border border-purple-500/20 bg-purple-950/10 p-3">
          <div className="rounded bg-purple-500/15 p-1.5 text-purple-400 border border-purple-500/30 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-purple-200">3. Zero-Day Autoencoder</div>
            <div className="mt-0.5 text-[11px] text-purple-300/80">
              If MSE Loss &gt; 0.045 on novel behavior -&gt; Flag Unknown Zero-Day!
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
          <div className="rounded bg-slate-800 p-1.5 text-slate-300 border border-slate-700 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200">4. Benign Clearance</div>
            <div className="mt-0.5 text-[11px] text-slate-400">
              Low MSE reconstruction and non-attack classifier allows normal flow.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
