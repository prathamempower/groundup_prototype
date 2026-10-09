// GroundUp AI — ProvenanceDrawer (Redesigned)
// Click-through source drill-down for any financial figure

import React from 'react';
import { X, FileText, ArrowRight, CheckCircle2, AlertTriangle, ExternalLink, Shield } from 'lucide-react';

interface ProvenanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  targetType: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay';
  category?: string;
}

interface ProvenanceNode {
  id: string;
  label: string;
  amount: number;
  confidence?: number;
  sourceFile: string;
  sourcePage: string;
  status: 'confirmed' | 'auto-posted' | 'pending';
  date: string;
  enteredBy: string;
}

const PROVENANCE_DATA: Record<string, { title: string; total: number; formula: string; nodes: ProvenanceNode[] }> = {
  spend: {
    title: 'Spend Truth — All Categories',
    total: 1412400,
    formula: 'ActualSpend = Σ PostedExpenses where expense.status = \'posted\'',
    nodes: [
      { id: 'e1', label: 'Electrical — ABC Electric LLC', amount: 68400, confidence: 98, sourceFile: 'Electrical_Invoice_Sep.pdf', sourcePage: 'Page 1, Row 1', status: 'confirmed', date: 'Sep 28, 2026', enteredBy: 'CFO Review' },
      { id: 'e2', label: 'Foundation — Concrete Pros Inc', amount: 95000, confidence: 99, sourceFile: 'Draw1_BCB_Bank.pdf', sourcePage: 'Page 3, Line 2', status: 'confirmed', date: 'May 15, 2026', enteredBy: 'Lender disbursement' },
      { id: 'e3', label: 'Framing — Johnson Lumber Co', amount: 142000, confidence: 97, sourceFile: 'April_Expenses.xlsx', sourcePage: 'Sheet "Expenses", Row 47', status: 'auto-posted', date: 'Jul 8, 2026', enteredBy: 'AI extracted (97% confidence)' },
      { id: 'e4', label: 'Plumbing — NJ Pipe Services', amount: 55760, confidence: 61, sourceFile: 'Plumbing_Invoice_Sep.pdf', sourcePage: 'Page 1', status: 'pending', date: 'Sep 28, 2026', enteredBy: '⚠️ Needs review — low confidence' },
    ],
  },
  budget: {
    title: 'Budget Truth — Current Approved Budget',
    total: 1820000,
    formula: 'CurrentBudget = LatestApprovedBudgetVersion + Σ ApprovedChangeOrders',
    nodes: [
      { id: 'b1', label: 'Budget v1.0 — Original Approval', amount: 1780000, confidence: 100, sourceFile: 'Budget_v1_Approved.xlsx', sourcePage: 'Master SOV', status: 'confirmed', date: 'Feb 14, 2026', enteredBy: 'CFO — Sarah Jenkins' },
      { id: 'b2', label: 'Change Order #1 — Foundation soil reinforcement', amount: 40000, confidence: 100, sourceFile: 'CO_001_Approved.pdf', sourcePage: 'Page 1', status: 'confirmed', date: 'Mar 12, 2026', enteredBy: 'Owner approval — Hardik' },
    ],
  },
  funded: {
    title: 'Funding Truth — Total Disbursed',
    total: 1094000,
    formula: 'AmountFunded = Σ DrawLine.funded_amount where status = \'disbursed\'',
    nodes: [
      { id: 'f1', label: 'Draw #1 — Initial disbursement', amount: 605000, confidence: 100, sourceFile: 'BCB_Draw1_Wire_Confirmation.pdf', sourcePage: 'Wire ref: 202604-3812', status: 'confirmed', date: 'May 10, 2026', enteredBy: 'Lender — BCB Bank' },
      { id: 'f2', label: 'Draw #2 — Framing milestone', amount: 304000, confidence: 100, sourceFile: 'BCB_Draw2_Wire_Confirmation.pdf', sourcePage: 'Wire ref: 202607-5591', status: 'confirmed', date: 'Jul 22, 2026', enteredBy: 'Lender — BCB Bank' },
      { id: 'f3', label: 'Draw #2 Supplement — Exterior', amount: 185000, confidence: 100, sourceFile: 'BCB_Draw2b_Disbursement.pdf', sourcePage: 'Wire ref: 202608-7723', status: 'confirmed', date: 'Aug 18, 2026', enteredBy: 'Lender — BCB Bank' },
    ],
  },
  exposure: {
    title: 'Developer Cash Exposure',
    total: 318400,
    formula: 'DeveloperCashExposure = TotalActualSpend ($1,412,400) − AmountFunded ($1,094,000)',
    nodes: [
      { id: 'ex1', label: 'Total Actual Spend (posted expenses)', amount: 1412400, confidence: 100, sourceFile: 'Multiple sources', sourcePage: 'See Spend Truth', status: 'confirmed', date: 'Oct 5, 2026', enteredBy: 'Calculation engine' },
      { id: 'ex2', label: 'Total Lender Disbursed (all draws)', amount: -1094000, confidence: 100, sourceFile: 'BCB Bank wires', sourcePage: 'See Funding Truth', status: 'confirmed', date: 'Aug 18, 2026', enteredBy: 'Calculation engine' },
    ],
  },
  delay: {
    title: 'Schedule Delay Cost',
    total: 26568,
    formula: 'DelayCost = ScheduleDelayDays (82) × DailyCarryingCost ($324/day = $1,094,000 × 9.75% ÷ 365)',
    nodes: [
      { id: 'd1', label: 'Plans & Permits delay (+14 days)', amount: 4536, confidence: 100, sourceFile: 'Timeline_v1.xlsx', sourcePage: 'Row: Plans & Permits', status: 'confirmed', date: 'Sep 15, 2025', enteredBy: 'PM confirmation' },
      { id: 'd2', label: 'Rough Plumbing delay (+27 days)', amount: 8748, confidence: 100, sourceFile: 'Timeline_v1.xlsx', sourcePage: 'Row: Rough Plumbing', status: 'confirmed', date: 'Mar 28, 2026', enteredBy: 'Inspection record' },
      { id: 'd3', label: 'Other milestone delays (+41 days combined)', amount: 13284, confidence: 100, sourceFile: 'Timeline_v1.xlsx', sourcePage: 'Multiple rows', status: 'confirmed', date: 'Various', enteredBy: 'PM + lender inspections' },
    ],
  },
};

export function ProvenanceDrawer({
  isOpen,
  onClose,
  projectId,
  projectName,
  targetType,
  category,
}: ProvenanceDrawerProps) {
  if (!isOpen) return null;

  const key = category ? 'spend' : targetType;
  const data = PROVENANCE_DATA[key] ?? PROVENANCE_DATA.spend;
  const title = category ? `Spend Truth — ${category}` : data.title;

  const statusStyle = (status: string) => {
    if (status === 'confirmed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'auto-posted') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const confidenceBadge = (conf?: number) => {
    if (!conf) return null;
    const color = conf >= 90 ? 'text-emerald-700' : conf >= 70 ? 'text-amber-700' : 'text-red-700';
    const bg = conf >= 90 ? 'bg-emerald-50' : conf >= 70 ? 'bg-amber-50' : 'bg-red-50';
    return (
      <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono font-semibold ${color} ${bg}`}>
        {conf}%
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full border-l border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Provenance Audit</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              ${Math.abs(data.total).toLocaleString()}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Formula */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Formula Applied</div>
          <div className="text-xs font-mono text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2">{data.formula}</div>
        </div>

        {/* Provenance tree */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Source Records ({data.nodes.length})</div>

          {data.nodes.map((node, i) => (
            <div key={node.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyle(node.status)}`}>
                      {node.status === 'confirmed' ? '✓ Confirmed' : node.status === 'auto-posted' ? 'Auto-posted' : '⚠️ Pending Review'}
                    </span>
                    {confidenceBadge(node.confidence)}
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">{node.label}</div>
                  <div className={`text-xl font-bold font-mono mt-1 ${node.amount < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {node.amount < 0 ? '-' : ''}${Math.abs(node.amount).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700">{node.sourceFile}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{node.sourcePage}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="text-slate-400">Date:</span>
                  <span>{node.date}</span>
                  <span className="text-slate-400">·</span>
                  <span>{node.enteredBy}</span>
                </div>
              </div>

              <button className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition font-medium cursor-pointer">
                <ExternalLink className="w-3 h-3" /> View Source Document
              </button>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-400 text-center">
            Every figure is directly linked to its source document. AI extracts the information, while verified financial calculations total the amounts.
          </div>
        </div>
      </div>
    </div>
  );
}
