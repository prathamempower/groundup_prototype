import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DelayAttributionSectionProps {
  delayDays: number;
  setDelayDays: (days: number) => void;
  delayCause: string;
  setDelayCause: (cause: string) => void;
  dailyCarryingCost: number;
}

export function DelayAttributionSection({
  delayDays,
  setDelayDays,
  delayCause,
  setDelayCause,
  dailyCarryingCost,
}: DelayAttributionSectionProps) {
  const delayCarryingImpact = delayDays * dailyCarryingCost;

  return (
    <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-amber-900 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Delay Attribution & Carry Impact</span>
        </span>
        <span className="font-mono font-bold text-amber-900">
          +${delayCarryingImpact.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-medium text-amber-800 mb-0.5">Delay Slip (Days)</label>
          <input
            type="number"
            min="0"
            max="180"
            value={delayDays}
            onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded font-mono font-bold text-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-amber-800 mb-0.5">Root Cause Tag</label>
          <select
            value={delayCause}
            onChange={(e) => setDelayCause(e.target.value)}
            className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded text-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
          >
            <option value="MUNICIPAL_PERMIT">Municipal / Permit Delay</option>
            <option value="UTILITY_INTERCONNECT">PSE&G / Utility Interconnect</option>
            <option value="WEATHER">Inclement Weather (Rain/Snow)</option>
            <option value="SUB_PERFORMANCE">Subcontractor Shortage</option>
            <option value="GC_COORDINATION">GC Material Lead Time</option>
          </select>
        </div>
      </div>

      <div className="text-[11px] text-amber-700">
        Calculation: {delayDays} days × ${dailyCarryingCost}/day = <strong>${delayCarryingImpact.toLocaleString()}</strong> in loan carrying cost.
      </div>
    </div>
  );
}
