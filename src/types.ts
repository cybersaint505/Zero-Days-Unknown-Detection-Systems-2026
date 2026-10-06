export interface NIDSMetrics {
  requestThroughput: number; // flows/sec
  peakThroughput: number;
  anomalyDetectionRate: number; // percentage (e.g. 4.82%)
  totalActiveThreats: number;
  knownThreatsCount: number;
  zeroDayThreatsCount: number;
  avgLatencyMs: number;
  supervisedF1Macro: number;
  anomalyThreshold: number;
  bufferQueueUsage: number; // percentage
  totalFlowsProcessed: number;
  modelStatus: 'ACTIVE' | 'CALIBRATING' | 'DRIFT_DETECTED';
}

export type FusionDecision = 'BENIGN' | 'KNOWN_ATTACK' | 'SUSPECTED_ZERO_DAY';
export type EnforcementAction = 'ALLOW' | 'BLOCK' | 'QUARANTINE' | 'INSPECT';

export interface FlowEvent {
  id: string;
  timestamp: string;
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  service: string;
  supervisedLabel: string;
  supervisedConfidence: number;
  anomalyScore: number; // Autoencoder MSE
  anomalyThreshold: number;
  decision: FusionDecision;
  action: EnforcementAction;
  isZeroDay: boolean;
  flowFeatures: {
    duration: number;
    sbytes: number;
    dbytes: number;
    sttl: number;
    dttl: number;
    sload: number;
    ct_srv_src: number;
  };
}

export interface ThreatCategorySummary {
  category: string;
  count: number;
  percentage: number;
  type: 'KNOWN' | 'ZERO_DAY';
  color: string;
}

export interface MetricTrendPoint {
  time: string;
  throughput: number;
  anomalyRate: number;
  activeThreats: number;
  zeroDayThreats?: number;
  knownThreats?: number;
}
