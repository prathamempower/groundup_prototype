import React from 'react';
import { FileText } from 'lucide-react';

export function ExecutiveNarrativeCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-700" />
          <h3 className="font-bold text-slate-900 text-base">Monthly Executive Narrative (October 2026)</h3>
        </div>
        <span className="text-slate-400 font-mono text-[11px]">Approved by Hardik Parikh · Oct 2, 2026</span>
      </div>

      <div className="prose prose-sm max-w-none text-slate-700 space-y-3 leading-relaxed">
        <p>
          <strong>Construction Progress:</strong> 73 Broadway has reached substantial completion on rough framing and exterior roofing. Rough plumbing passed municipal inspection on first review, and rough electrical rough-in is currently 80% complete. Windows and exterior doors are installed and weather-sealed.
        </p>
        <p>
          <strong>Financial Health & Budget:</strong> Total construction budget spend is tracking at 73% of revised baseline ($1.41M incurred). A $40,000 contingency reallocation was utilized during Q1 to absorb unexpected soft soil piles at the rear foundation. The remaining 10% Reserve Contingency stands at $42,000, which is deemed healthy for final finishes and mechanical trim.
        </p>
        <p>
          <strong>Sales & Disposition:</strong> Market response in Hoboken remains very strong. Units 1 and 3 are executed under firm contract with 10% cash deposits in attorney escrow. Total projected sales volume of $3.25M comfortably exceeds initial underwriting expectations, delivering a forecasted net investor return of 17.9% despite township permit delays.
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500">
        <span>Next anticipated capital event: <strong>Final Construction Draw #4 (November 2026)</strong></span>
        <span className="text-purple-700 font-semibold cursor-pointer hover:underline">
          View Historical Monthly Archives →
        </span>
      </div>
    </div>
  );
}
