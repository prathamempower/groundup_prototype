import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface PortfolioAlertBannerProps {
  onNavigateDraws: () => void;
}

export const PortfolioAlertBanner: React.FC<PortfolioAlertBannerProps> = ({ onNavigateDraws }) => {
  return (
    <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 bg-red-100 rounded-xl text-red-600 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-red-950">2 Critical Items Need Your Attention</h4>
          <p className="text-xs text-red-700 mt-0.5">
            73 Broadway plumbing spend is ahead of progress by 27%, and draw request #4 is waiting for lender wire sign-off.
          </p>
        </div>
      </div>
      <button
        onClick={onNavigateDraws}
        className="text-xs font-bold text-red-800 hover:text-red-950 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 bg-red-100/60 hover:bg-red-200/60 rounded-xl transition cursor-pointer self-start sm:self-center"
      >
        <span>Review Draw & Spend</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
