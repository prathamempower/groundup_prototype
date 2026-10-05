// GroundUp AI — Investor / Partner Transparency Portal
// High-level financial health, capital distribution schedule, and certified monthly reporting

import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowUpRight,
  FileText,
  Clock,
  Home
} from 'lucide-react';
import { Project } from '../../shared/types';

interface InvestorPortalScreenProps {
  projects: Project[];
  selectedProjectId: string;
}

export function InvestorPortalScreen({
  projects,
  selectedProjectId,
}: InvestorPortalScreenProps) {
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Investor metrics
  const investorEquity = 450000; // $450,000 equity invested
  const projectedNetReturn = 387000;
  const targetROI = 27.7;
  const forecastROI = 17.9;

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Toast */}
      {downloadSuccess && (
        <div className="bg-purple-950 border border-purple-800 text-white px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Certified Monthly Executive Report (October 2026 PDF) downloaded successfully.</span>
          </div>
          <span className="text-[10px] text-purple-300 font-mono">SHA-256 Verified</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
              Investor Transparency Portal · Read-Only Access
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Investment Performance & Distribution Schedule</h1>
          <p className="text-xs text-slate-500">
            Investor: Krutarth Shah · Project: {activeProject.name} (73 Broadway, Hoboken)
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Certified Report (PDF)</span>
        </button>
      </div>

      {/* Investor Return KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Capital Equity Deployed</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
            ${investorEquity.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">Funded at land acquisition</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Projected Investor Profit</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
            +${projectedNetReturn.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600">Net after loan payoff</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Forecasted Total Return (ROI)</span>
          <div className="text-xl font-bold font-mono text-purple-700 mt-0.5">
            {forecastROI}%
          </div>
          <span className="text-[10px] text-slate-400">Baseline Target: {targetROI}%</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Project Health & Sales</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">
            2 of 3 Under Contract
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">67% Pre-Sold (Strong Demand)</span>
        </div>
      </div>

      {/* Condominium Sales & Distribution Waterfall */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Condominium Sales & Capital Return Waterfall</h3>
            <p className="text-xs text-slate-500">Unit contract closings fund construction loan retirement before investor equity distribution</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Total Revenue: $3,250,000
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          {[
            {
              unit: 'Unit 1 — Penthouse Duplex',
              status: 'UNDER CONTRACT',
              price: '$1,225,000',
              deposit: '$122,500',
              closeDate: 'Nov 30, 2026',
              loanAllocation: '$650,000 Loan Payoff',
              netProceeds: '$520,250 Equity Cashflow',
            },
            {
              unit: 'Unit 2 — Mid-Floor Residence',
              status: 'AVAILABLE',
              price: '$1,050,000 (Asking)',
              deposit: '—',
              closeDate: 'Jan 2027 (Expected)',
              loanAllocation: '$444,000 Final Loan Payoff',
              netProceeds: '$559,500 Equity Cashflow',
            },
            {
              unit: 'Unit 3 — Garden Duplex',
              status: 'UNDER CONTRACT',
              price: '$980,000',
              deposit: '$98,000',
              closeDate: 'Dec 15, 2026',
              loanAllocation: '$0 (Loan Retired)',
              netProceeds: '$936,600 Pure Distribution',
            },
          ].map((u) => (
            <div key={u.unit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{u.unit}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  u.status === 'UNDER_CONTRACT' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {u.status.replace('_', ' ')}
                </span>
              </div>
              <div className="font-mono text-base font-bold text-slate-900">{u.price}</div>
              <div className="text-[11px] text-slate-500">Expected Closing: {u.closeDate}</div>
              <div className="pt-2 border-t border-slate-200 space-y-1 font-mono text-[11px]">
                <div className="text-slate-600">{u.loanAllocation}</div>
                <div className="text-emerald-700 font-bold">{u.netProceeds}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Narrative Update */}
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
    </div>
  );
}
