import React from 'react';
import { ThreatCategorySummary } from '../types';

interface ThreatAnalyticsPanelProps {
  threatCategories: ThreatCategorySummary[];
}

export const ThreatAnalyticsPanel: React.FC<ThreatAnalyticsPanelProps> = ({
  threatCategories,
}) => {
  return (
    <div>
      {/* 1. Threat Taxonomy Breakdown */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-semibold text-white text-sm">Active Threat Classification</h3>
            <p className="text-xs text-slate-400">Known Signatures vs Zero-Day Deviations</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            {threatCategories.reduce((acc, curr) => acc + curr.count, 0)} Total
          </span>
        </div>

        <div className="mt-4 space-y-3.5">
          {threatCategories.map((cat) => (
            <div key={cat.category}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.category}
                </span>
                <span className="font-mono text-slate-400">
                  {cat.count} <span className="text-slate-600">({cat.percentage.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
