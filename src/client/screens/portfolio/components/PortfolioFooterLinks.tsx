import React from 'react';
import { ArrowUpRight, Sparkles, ShieldCheck } from 'lucide-react';

interface PortfolioFooterLinksProps {
  onNavigateDraws: () => void;
  onOpenDealLab: () => void;
  onSelectProject: (id: string) => void;
}

export const PortfolioFooterLinks: React.FC<PortfolioFooterLinksProps> = ({
  onNavigateDraws,
  onOpenDealLab,
  onSelectProject,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200/80">
      <button
        onClick={onNavigateDraws}
        className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition text-left cursor-pointer shadow-2xs group"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
          <ArrowUpRight className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900">Submit Draw Request</div>
          <div className="text-[11px] text-slate-500">Compile verified invoices & lien waivers</div>
        </div>
      </button>

      <button
        onClick={onOpenDealLab}
        className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition text-left cursor-pointer shadow-2xs group"
      >
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900">Underwrite New Deal</div>
          <div className="text-[11px] text-slate-500">Calculate pro forma margins, comps & IRR</div>
        </div>
      </button>

      <button
        onClick={() => onSelectProject('1')}
        className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition text-left cursor-pointer shadow-2xs group"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900">Audit Provenance</div>
          <div className="text-[11px] text-slate-500">Trace every dollar to its source invoice</div>
        </div>
      </button>
    </div>
  );
};
