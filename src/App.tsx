/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldAlert,
  Sparkles,
  Zap,
  Sliders,
  BarChart3,
  RefreshCw,
  Terminal,
  Layers,
  Radio,
  Clock,
} from 'lucide-react';
import { MetricCard } from './components/MetricCard';
import { TelemetryTable } from './components/TelemetryTable';
import { SimulationControls } from './components/SimulationControls';
import { ThreatTrendsSection } from './components/ThreatTrendsSection';
import { ThreatAnalyticsPanel } from './components/ThreatAnalyticsPanel';
import { FlowDetailsModal } from './components/FlowDetailsModal';
import { ModelEvaluationModal } from './components/ModelEvaluationModal';
import {
  INITIAL_NIDS_METRICS,
  INITIAL_FLOWS,
  THREAT_CATEGORIES,
  TREND_HISTORY,
} from './data/placeholderData';
import { FlowEvent, NIDSMetrics, ThreatCategorySummary, MetricTrendPoint } from './types';

export default function App() {
  // 1. High-level NIDS Health Metrics Placeholder State
  const [metrics, setMetrics] = useState<NIDSMetrics>(INITIAL_NIDS_METRICS);

  // 2. Telemetry and event logs placeholder state
  const [flows, setFlows] = useState<FlowEvent[]>(INITIAL_FLOWS);
  const [threatCategories, setThreatCategories] = useState<ThreatCategorySummary[]>(THREAT_CATEGORIES);
  const [trends, setTrends] = useState<MetricTrendPoint[]>(TREND_HISTORY);

  // 3. UI interaction & modal state
  const [selectedFlow, setSelectedFlow] = useState<FlowEvent | null>(null);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [speed, setSpeed] = useState<'NORMAL' | 'BURST'>('NORMAL');
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  // 4. Simulated streaming jitter effect
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Subtle organic jitter on throughput and processed counts
      setMetrics((prev) => {
        const base = speed === 'BURST' ? 2750 : 1420;
        const jitter = Math.floor(Math.random() * 80) - 40;
        const newThroughput = Math.max(800, base + jitter);
        const increment = speed === 'BURST' ? 28 : 14;

        return {
          ...prev,
          requestThroughput: newThroughput,
          totalFlowsProcessed: prev.totalFlowsProcessed + increment,
          bufferQueueUsage: +(12 + Math.random() * 4).toFixed(1),
        };
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isStreaming, speed]);

  // Inject a synthetic Zero-Day Attack flow
  const handleInjectZeroDay = () => {
    const timestamp = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100);
    const id = `fl-${Math.floor(Math.random() * 8000 + 2000)}`;

    const novelFlow: FlowEvent = {
      id,
      timestamp,
      srcIp: `198.51.100.${Math.floor(Math.random() * 200 + 10)}`,
      srcPort: Math.floor(Math.random() * 30000 + 30000),
      dstIp: '10.0.0.24',
      dstPort: 9000,
      protocol: 'TCP',
      service: 'custom-proto-v2',
      supervisedLabel: 'Benign (Low Conf)',
      supervisedConfidence: 0.44, // XGBoost fails on novel pattern!
      anomalyScore: +(0.165 + Math.random() * 0.08).toFixed(4), // High MSE Autoencoder reconstruction!
      anomalyThreshold: metrics.anomalyThreshold,
      decision: 'SUSPECTED_ZERO_DAY',
      action: 'QUARANTINE',
      isZeroDay: true,
      flowFeatures: {
        duration: 3.42,
        sbytes: 65400,
        dbytes: 840,
        sttl: 254,
        dttl: 12,
        sload: 153000,
        ct_srv_src: 1,
      },
    };

    // Update state
    setFlows((prev) => [novelFlow, ...prev.slice(0, 19)]);
    setMetrics((prev) => {
      const newZeroDays = prev.zeroDayThreatsCount + 1;
      const newTotal = prev.totalActiveThreats + 1;
      const newRate = +((newTotal / (prev.totalFlowsProcessed / 1000 + 10)) * 2.5).toFixed(2);

      return {
        ...prev,
        zeroDayThreatsCount: newZeroDays,
        totalActiveThreats: newTotal,
        anomalyDetectionRate: +(prev.anomalyDetectionRate + 0.12).toFixed(2),
      };
    });

    setThreatCategories((prev) =>
      prev.map((c) =>
        c.type === 'ZERO_DAY'
          ? { ...c, count: c.count + 1, percentage: +(c.percentage + 1.2).toFixed(1) }
          : c
      )
    );

    setLastNotification(`🚨 Novel Zero-Day threat detected: Flow ${id} exceeded reconstruction threshold (MSE > 0.045)`);
    setTimeout(() => setLastNotification(null), 5000);
  };

  const handleReset = () => {
    setMetrics(INITIAL_NIDS_METRICS);
    setFlows(INITIAL_FLOWS);
    setThreatCategories(THREAT_CATEGORIES);
    setTrends(TREND_HISTORY);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top SOC Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L4 5.5V11C4 16.5 7.4 20.8 12 22C16.6 20.8 20 16.5 20 11V5.5L12 2Z"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 7V11M12 11L9.5 13.5M12 11L14.5 13.5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="7" r="1" fill="currentColor" />
                <circle cx="9.5" cy="13.5" r="1" fill="currentColor" />
                <circle cx="14.5" cy="13.5" r="1" fill="currentColor" />
                <path
                  d="M9 17C10 17.8 11 18.2 12 18.2C13 18.2 14 17.8 15 17"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  Zero-Days &amp; Unknown Attack Detection System
                </h1>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                  <Radio className="h-3 w-3 animate-pulse" />
                  ONLINE INFERENCE ENGINE
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEvaluationOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
              Offline Benchmark Metrics
            </button>
          </div>
        </div>
      </header>

      {/* Floating Alert Notification */}
      {lastNotification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-3">
          <div className="flex items-center justify-between rounded-lg border border-purple-500/40 bg-purple-950/70 px-4 py-2.5 text-xs font-medium text-purple-200 backdrop-blur-md shadow-lg shadow-purple-950/40 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400 animate-spin" />
              <span>{lastNotification}</span>
            </div>
            <button
              onClick={() => setLastNotification(null)}
              className="text-purple-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Simulation Stream Controls */}
        <SimulationControls
          isStreaming={isStreaming}
          onToggleStreaming={() => setIsStreaming(!isStreaming)}
          onInjectZeroDay={handleInjectZeroDay}
          onReset={handleReset}
          speed={speed}
          onToggleSpeed={() => setSpeed(speed === 'NORMAL' ? 'BURST' : 'NORMAL')}
        />

        {/* Threat Trends (Last 10 Minutes via Recharts) */}
        <ThreatTrendsSection trends={trends} />

        {/* Telemetry Stream Ingestion Table */}
        <TelemetryTable flows={flows} onSelectFlow={(flow) => setSelectedFlow(flow)} />

        {/* Threat Analytics Panel (Second to last) */}
        <ThreatAnalyticsPanel threatCategories={threatCategories} />

        {/* HIGH-LEVEL NIDS HEALTH METRICS CARDS */}
        <section aria-label="High-Level NIDS Health Metrics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Current Request Throughput */}
            <MetricCard
              title="Request Throughput"
              value={metrics.requestThroughput.toLocaleString()}
              unit="flows/s"
              subtitle="Real-time ingestion speed"
              icon={Activity}
              statusColor="cyan"
              badgeText="LIVE STREAM"
              trend={{
                value: speed === 'BURST' ? '+94.2%' : '+8.4%',
                isPositive: true,
                label: 'vs baseline',
              }}
            />

            {/* Metric 2: Zero-Days Attack Detection Rate */}
            <MetricCard
              title="Zero-Days Attack Detection Rate"
              value={`${metrics.anomalyDetectionRate}%`}
              subtitle="Reconstruction MSE > 0.045"
              icon={Sparkles}
              statusColor="purple"
              trend={{
                value: 'τ = 0.0450',
                isPositive: true,
                label: '99th pct cutoff',
              }}
            />

            {/* Metric 3: Total Active Threats */}
            <MetricCard
              title="Total Active Threats"
              value={metrics.totalActiveThreats}
              unit="threats"
              subtitle={`${metrics.zeroDayThreatsCount} zero-day • ${metrics.knownThreatsCount} known signatures`}
              icon={ShieldAlert}
              statusColor="rose"
              badgeText="ALERTING"
              secondaryInfo={{
                label: 'Auto-Quarantine',
                value: 'Enabled',
              }}
            />

            {/* Metric 4: Model Fusion Latency & Status */}
            <MetricCard
              title="Inference Latency"
              value={metrics.avgLatencyMs}
              unit="ms"
              subtitle="ONNX dual-pass inference"
              icon={Zap}
              statusColor="emerald"
              badgeText="FASTAPI ACTIVE"
              secondaryInfo={{
                label: 'Processed',
                value: `${(metrics.totalFlowsProcessed / 1000).toFixed(1)}k flows`,
              }}
            />
          </div>
        </section>
      </main>



      {/* Inspect Flow Modal */}
      <FlowDetailsModal flow={selectedFlow} onClose={() => setSelectedFlow(null)} />

      {/* Offline Model Evaluation Modal */}
      <ModelEvaluationModal
        isOpen={isEvaluationOpen}
        onClose={() => setIsEvaluationOpen(false)}
      />
    </div>
  );
}
