import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Project } from '../../shared/types';
import { CONDO_UNIT_SALES } from './investor/mock-data';
import { InvestorHeader } from './investor/components/InvestorHeader';
import { InvestorKPITiles } from './investor/components/InvestorKPITiles';
import { CondoWaterfallSection } from './investor/components/CondoWaterfallSection';
import { ExecutiveNarrativeCard } from './investor/components/ExecutiveNarrativeCard';

interface InvestorPortalScreenProps {
  projects: Project[];
  selectedProjectId: string;
}

export function InvestorPortalScreen({
  projects,
  selectedProjectId,
}: InvestorPortalScreenProps) {
  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const investorEquity = 450000;
  const projectedNetReturn = 387000;
  const targetROI = 27.7;
  const forecastROI = 17.9;

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {downloadSuccess && (
        <div className="bg-purple-950 border border-purple-800 text-white px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Certified Monthly Executive Report (October 2026 PDF) downloaded successfully.</span>
          </div>
          <span className="text-[10px] text-purple-300 font-mono">SHA-256 Verified</span>
        </div>
      )}

      <InvestorHeader activeProject={activeProject} onDownload={handleDownload} />

      <InvestorKPITiles
        investorEquity={investorEquity}
        projectedNetReturn={projectedNetReturn}
        targetROI={targetROI}
        forecastROI={forecastROI}
      />

      <CondoWaterfallSection sales={CONDO_UNIT_SALES} />

      <ExecutiveNarrativeCard activeProject={activeProject} />
    </div>
  );
}
