import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function AuthHero() {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-slate-900 text-white p-12">
      <div>
        <div className="flex items-center gap-3 mb-12">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <span className="text-xl font-bold text-slate-900">G</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">GroundUp AI</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Construction Finance Intelligence</h1>
          <p className="text-slate-300 text-lg mb-10 leading-relaxed">
            Track every dollar from land acquisition to unit closing. Built for real estate developers who demand clarity.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-slate-200">4 Domain Truths: Budget · Spend · Funding · Progress</p>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-slate-200">Every number traced to its source document</p>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-slate-200">AI-assisted extraction, human-confirmed accuracy</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-slate-400 text-sm">
          Trusted by developers managing $50M+ in active projects
        </p>
      </div>
    </div>
  );
}
